import { test, expect, jest ,afterEach, it, beforeAll, beforeEach, describe } from "@jest/globals"
import request from "supertest"
import CartController from "../../src/controllers/cartController"
import {app} from "../.."
import { Role, User } from "../../src/components/user"
import { Product, Category } from "../../src/components/product";
import { Cart, ProductInCart } from "../../src/components/cart";
import Authenticator from "../../src/routers/auth"
import ErrorHandler from "../../src/helper";

const baseURL = "/ezelectronics/carts"
jest.mock("../../src/routers/auth")
jest.mock("../../src/controllers/productController")

describe("cart routing test",()=>{
    const mockUser = new User("tusername","tname","tsurname", Role.CUSTOMER , "taddress", "10-10-1999");
    const product = new Product(50.0, "Samsung GalaxyA54", Category.SMARTPHONE, "", "", 50);
    const mockCart = {
        customer: "tcustomer",
        paid: true,
        paymentDate: "11-06-2024",
        products: [
            {
                model: "Samsung GalaxyA54",
                quantity: 10,
                category: Category.SMARTPHONE,
                price: 50.00,
            }
        ],
        total: 10
    }

    describe("GET /carts",()=>{
        test("my test",async ()=>{
            jest.spyOn(Authenticator.prototype,"isLoggedIn")
            .mockImplementation((req,res,next)=>next())

            jest.spyOn(Authenticator.prototype,"isCustomer")
            .mockImplementation((req,res,next)=>next())

            jest.spyOn(CartController.prototype, "getCart").mockResolvedValueOnce(mockCart as Cart)

            const response = await request(app)
            .get(baseURL + "/")
            .set("user", JSON.stringify(mockUser))
            //console.log(response);
            

            expect(response.status).toBe(200)
            expect(response.body).toEqual(mockCart)

            expect(CartController.prototype.getCart).toHaveBeenCalledTimes(1)
            expect(CartController.prototype.getCart).toHaveBeenCalledWith(undefined)

            jest.resetAllMocks()
        })
    })
    describe("POST /carts", () => {
        test("should add a product to the cart", async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(Authenticator.prototype, "isCustomer")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(CartController.prototype, "addToCart")
                .mockResolvedValueOnce(true);

            const response = await request(app)
                .post(baseURL + "/")
                .set("user", JSON.stringify(mockUser))
                .send({ model: "Samsung GalaxyA54" });

            expect(response.status).toBe(200);

            expect(CartController.prototype.addToCart).toHaveBeenCalledTimes(1);
            // expect(CartController.prototype.addToCart).toHaveBeenCalledWith(mockUser, { model: "Samsung GalaxyA54" });

            jest.resetAllMocks();
        });
    });
})