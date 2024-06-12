import { test, expect, jest,afterEach,beforeEach } from "@jest/globals"
import request from "supertest"
import { app } from "../../index"
import {Role, User} from "../../src/components/user"
import Authenticator from "../../src/routers/auth"
import ErrorHandler from "../../src/helper"
import { ProductNotFoundError,ProductAlreadyExistsError, ProductSoldError,EmptyProductStockError,LowProductStockError} from "../../src/errors/productError";
import {UnauthorizedUserError} from "../../src/errors/userError";
import { Category, Product } from "../../src/components/product"
import ProductController from "../../src/controllers/productController"
import {DateError} from "../../src/utilities"

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
const testproduct1 = new Product(1000, "telephone", Category.SMARTPHONE, "2022-01-01", "", 30);
const testproduct2 = {sellingPrice: 1000, model: "telephone", category: Category.SMARTPHONE, arrivalDate: "2030-01-01", details: "", quantity: 30};
const testproduct3 = {sellingPrice: 1000, model: "telephone3", category: Category.SMARTPHONE, arrivalDate: "2030-01-01", details: "", quantity: 0};
const testproduct4 = {sellingPrice: 1000, model: "telephone4", category: Category.SMARTPHONE, arrivalDate: "2030-01-01", details: "", quantity: 2};

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
            jest.spyOn(ProductController.prototype, "registerProducts").mockRejectedValue(new ProductAlreadyExistsError())

            const response = await request(app).post(baseURL + "/products").send(testproduct1).expect(409) 
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1)
        })

        test("It should return a 400 error code", async () => {
            jest.spyOn(Authenticator.prototype, "isManager").mockImplementation((req,res,next)=>next());
            jest.spyOn(ProductController.prototype, "registerProducts").mockRejectedValue(new DateError())

            const response = await request(app).post(baseURL + "/products").send(testproduct2).expect(400) 
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1)
        })
    })

    describe("PATCH /products/:model", () => {
        let quantitytoadd : number = 5;
        test("It should return a 200 success code", async () => {
            jest.spyOn(Authenticator.prototype,"isManager").mockImplementation((req,res,next)=>next());
            jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValueOnce(testproduct1.quantity+quantitytoadd) 

            const response = await request(app).post(baseURL + `/products/${testproduct1.model}`)
            .send({model : testproduct1.model, quantity: quantitytoadd, arrivalDate : ""}).expect(200)
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(1)
        })

        test("It should return a 400 error code - new arrivalDate before the old one", async () => {
            jest.spyOn(Authenticator.prototype,"isManager").mockImplementation((req,res,next)=>next());
            jest.spyOn(ProductController.prototype, "changeProductQuantity").mockRejectedValue(new DateError()) 

            const response = await request(app).post(baseURL + `/products/${testproduct1.model}`)
            .send({model : testproduct1.model, quantity: quantitytoadd, arrivalDate : "2000/01/01"}).expect(400)
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(1)
        })

        test("It should return a 400 error code - arrivalDate is in the future", async () => {
            jest.spyOn(Authenticator.prototype,"isManager").mockImplementation((req,res,next)=>next());
            jest.spyOn(ProductController.prototype, "changeProductQuantity").mockRejectedValue(new DateError()) 

            const response = await request(app).post(baseURL + `/products/${testproduct1.model}`)
            .send({model : testproduct1.model, quantity: quantitytoadd, arrivalDate : "2100/01/01"}).expect(400)
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(1)
        })

        test("It should return a 404 error code - ProductNotFoundError", async () => {
            jest.spyOn(Authenticator.prototype,"isManager").mockImplementation((req,res,next)=>next());
            jest.spyOn(ProductController.prototype, "changeProductQuantity").mockRejectedValue(new ProductNotFoundError()) 

            const response = await request(app).post(baseURL + `/products/${testproduct1.model}`)
            .send({model : testproduct1.model, quantity: quantitytoadd, arrivalDate : ""}).expect(404)
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(0);
            expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(0)
        })
    })

    describe("PATCH /products/:model/sell", () => {
        let quantitySold : number = 5;
        test("it should return a 200 success code", async () => {
            jest.spyOn(Authenticator.prototype,"isManager").mockImplementation((req,res,next)=>next());
            jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValue(testproduct1.quantity - quantitySold) 

            const response = await request(app).post(baseURL + `/products/${testproduct1.model}/sell`)
            .send({sellingDate: "", quantity: quantitySold}).expect(200)
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1)
        })

        test("it should return a 404 error code - ProductNotFound", async () => {
            jest.spyOn(Authenticator.prototype,"isManager").mockImplementation((req,res,next)=>next());
            jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValue(new ProductNotFoundError()) 

            const response = await request(app).post(baseURL + `/products/ciao/sell`)
            .send({sellingDate: "", quantity: quantitySold}).expect(404)
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(0);
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(0)
        })

        test("it should return a 400 error code - DateError - seelingDate in the future", async () => {
            jest.spyOn(Authenticator.prototype,"isManager").mockImplementation((req,res,next)=>next());
            jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValue(new DateError()) 

            const response = await request(app).post(baseURL + `/products/${testproduct1.model}/sell`)
            .send({sellingDate: "2100/01/01", quantity: quantitySold}).expect(400)
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(0);
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(0)
        })

        test("it should return a 400 error code - DateError - seelingDate before the arrivalDate", async () => {
            jest.spyOn(Authenticator.prototype,"isManager").mockImplementation((req,res,next)=>next());
            jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValue(new DateError()) 

            const response = await request(app).post(baseURL + `/products/${testproduct1.model}/sell`)
            .send({sellingDate: "1200/01/01", quantity: quantitySold}).expect(400)
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(0);
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(0)
        })

        test("it should return a 409 error code - LowProductStockError", async () => {
            jest.spyOn(Authenticator.prototype,"isManager").mockImplementation((req,res,next)=>next());
            jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValue(new LowProductStockError()) 

            const response = await request(app).post(baseURL + `/products/${testproduct4.model}/sell`)
            .send({sellingDate: "", quantity: quantitySold}).expect(409)
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(0);
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(0)
        })

        test("it should return a 409 error code - EmptyProductStockError", async () => {
            jest.spyOn(Authenticator.prototype,"isManager").mockImplementation((req,res,next)=>next());
            jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValue(new EmptyProductStockError()) 

            const response = await request(app).post(baseURL + `/products/${testproduct3.model}/sell`)
            .send({sellingDate: "", quantity: quantitySold}).expect(409)
            expect(Authenticator.prototype.isManager).toHaveBeenCalledTimes(0);
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(0)
        })
    })
})