import { test, expect, jest, beforeEach } from "@jest/globals"
import ReviewDAO from "../../src/dao/productDAO"
import db from "../../src/db/db"
import { User, Role } from '../../src/components/user';
import { ProductReview } from '../../src/components/review';
import { test, expect, jest, afterEach } from "@jest/globals"
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
describe("ReviewDAO unit testing", ()=>{
    describe("addReview test cases",()=>{
        test("It should add a new review", async () => {
            dao = new ReviewDAO();
            jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
            if (sql.includes('SELECT model FROM products')) {
                return callback(null, { model: "iPhone13" }); // Simulate product exists
            }
                return callback(null, null); // No existing review
            });
            const Run = jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
                return callback(null);
            });
            await expect(dao.addReview(testReview.model, testReview.user, testReview.score, testReview.comment)).resolves.toBeUndefined();
            expect(Run).toHaveBeenCalledTimes(1);
        });
    });
});
    