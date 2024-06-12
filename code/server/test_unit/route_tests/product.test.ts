import { test, expect, jest,afterEach,beforeEach } from "@jest/globals"
import request from "supertest"
import { app } from "../../index"
import {Role, User} from "../../src/components/user"
import Authenticator from "../../src/routers/auth"
import ErrorHandler from "../../src/helper"
import { ProductNotFoundError } from "../../src/errors/productError";
import {UnauthorizedUserError} from "../../src/errors/userError";
import { Category, Product } from "../../src/components/product"
import ProductController from "../../src/controllers/productController"


const baseURL = "/ezelectronics"
jest.mock("../../src/routers/auth")

const dummyMiddleware = (req: any, res: any, next: any) => next()

beforeEach(()=>{
    jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation(dummyMiddleware)
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation(dummyMiddleware)
})

afterEach(()=>{
    jest.resetAllMocks()
    jest.clearAllMocks()
})

const testuser1 = new User("testcust","testname1","testsurname1",Role.CUSTOMER,"testaddress1","testbirthdate1")
const testproduct1 = new Product(1000, "telephon", Category.SMARTPHONE, "2022-01-01", "", 30);
const testproduct2 = {sellingPrice: 1000, model: "telephon", category: Category.SMARTPHONE, arrivalDate: "2030-01-01", details: "", quantity: 30};

describe("Route tests product", () => {
    describe("POST /products", () => {
        test("It should return a 200 success code", async () => {
            jest.spyOn(Authenticator.prototype,"isManager").mockImplementation((req,res,next)=>next());
            jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce() 

            const response = await request(app).post(baseURL + "/products").send(testproduct1).expect(200) 
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1)
        })

        test("It should return a 409 error code", async () => {
            jest.spyOn(Authenticator.prototype,"isManager").mockImplementation((req,res,next)=>next());
            jest.spyOn(ProductController.prototype, "registerProducts").mockRejectedValue

            const response = await request(app).post(baseURL + "/products").send(testproduct1).expect(409) 
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1)
        })

        test("It should return a 400 error code", async () => {
            jest.spyOn(Authenticator.prototype, "isManager").mockImplementation((req,res,next)=>next());
            jest.spyOn(ProductController.prototype, "registerProducts").mockRejectedValue

            const response = await request(app).post(baseURL + "/products").send(testproduct2).expect(400) 
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1)
        })
    })
})