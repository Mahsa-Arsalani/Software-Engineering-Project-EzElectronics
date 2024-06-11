import { test, expect, jest, beforeEach} from "@jest/globals"
import ReviewDAO from "../../src/dao/ReviewDAO"
import db from "../../src/db/db"
import { User, Role } from '../../src/components/user';
import { ProductReview } from '../../src/components/review';
import { ExistingReviewError, NoReviewProductError } from '../../src/errors/reviewError';


jest.mock('../../src/db/db');

beforeEach(() => {
    jest.clearAllMocks();
});
const testUser = new User("testcust", "testname", "testsurname", Role.CUSTOMER, "testaddress", "testbirthdate")
const testReview = {
    model: "Alexa",
    user: testUser,
    date: "testdate",
    score: 3,
    comment: "testcomment"
}
let reviewdao: ReviewDAO;
describe("ReviewDAO unit testing", ()=>{
    describe("addReview test cases",()=>{
        test("It should add a new review", async () => {
            reviewdao = new ReviewDAO();
            jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
            if (sql.includes('SELECT model FROM products')) {
                return callback(null, { model: "iPhone13" }); // Simulate product exists
            }
                return callback(null, null); // No existing review
            });
            const Run = jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
                return callback(null);
            });
            await expect(reviewdao.addReview(testReview.model, testReview.user, testReview.score, testReview.comment)).resolves.toBeUndefined();
            expect(Run).toHaveBeenCalledTimes(1);
        });
        test("It should handle no product found error", async () => {
            reviewdao = new ReviewDAO();
            jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                return callback(null, null); // No product found
              });
            
              await expect(reviewdao.addReview(testReview.model, testReview.user, testReview.score, testReview.comment)).rejects.toThrow(NoReviewProductError);
        });
        test("It should handle existing review error", async () => {
            reviewdao = new ReviewDAO();
            jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                if (sql.includes('SELECT model FROM products')) {
                  return callback(null, { model: testReview.model}); // Simulate product exists
                }
                if (sql.includes('SELECT * FROM reviews')) {
                  return callback(null, { model: testReview.model, user: testReview.user.username}); // Simulate existing review
                }
                return callback(null, null);
            });
            await expect(reviewdao.addReview(testReview.model, testReview.user, testReview.score, testReview.comment)).rejects.toThrow(ExistingReviewError);
        });
        test("It should handle addReview database errors", async () => {
            reviewdao = new ReviewDAO();
            jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                return callback(new Error("Database error"), null);
              });
            
            await expect(reviewdao.addReview(testReview.model, testReview.user, testReview.score, testReview.comment)).rejects.toThrow(Error);
        });
    });
});

    