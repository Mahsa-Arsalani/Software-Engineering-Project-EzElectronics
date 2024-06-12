import { test, expect, jest, afterEach, it, beforeAll, beforeEach, describe } from "@jest/globals";
import request from "supertest";
import ProductController from "../../src/controllers/productController";
import { app } from "../..";
import { Role, User } from "../../src/components/user";
import { Category, Product } from "../../src/components/product";
import Authenticator from "../../src/routers/auth";
import ErrorHandler from "../../src/helper";

const baseURL = "/ezelectronics/products";
jest.mock("../../src/routers/auth");
jest.mock("../../src/controllers/productController");

describe("product routing test", () => {
    const mockUser = new User("tusername", "tname", "tsurname", Role.MANAGER, "taddress", "10-10-1999");
    const product: Product = {
        model: "Samsung GalaxyA54",
        category: Category.SMARTPHONE,
        quantity: 50,
        details: "",
        sellingPrice: 50.0,
        arrivalDate: "2024-06-10"
    };

    describe("POST /products", () => {
        test("should register a new product", async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(Authenticator.prototype, "isManager")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(ProductController.prototype, "registerProducts")
                .mockResolvedValueOnce(undefined);

            const response = await request(app)
                .post(baseURL + "/")
                .set("user", JSON.stringify(mockUser))
                .send(product);

            expect(response.status).toBe(200);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(
                product.model,
                product.category,
                product.quantity,
                product.details,
                product.sellingPrice,
                product.arrivalDate
            );

            jest.resetAllMocks();
        });
    });

    describe("PATCH /products/:model", () => {
        test("should change product quantity", async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(Authenticator.prototype, "isManager")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(ProductController.prototype, "changeProductQuantity")
                .mockResolvedValueOnce(60);

            const response = await request(app)
                .patch(baseURL + "/Samsung GalaxyA54")
                .set("user", JSON.stringify(mockUser))
                .send({ quantity: 10 });

            expect(response.status).toBe(200);
            expect(response.body.quantity).toBe(60);
            expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(
                "Samsung GalaxyA54",
                10,
                undefined
            );

            jest.resetAllMocks();
        });
    });

    describe("PATCH /products/:model/sell", () => {
        test("should sell product quantity", async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(Authenticator.prototype, "isManager")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(ProductController.prototype, "sellProduct")
                .mockResolvedValueOnce(40);

            const response = await request(app)
                .patch(baseURL + "/Samsung GalaxyA54/sell")
                .set("user", JSON.stringify(mockUser))
                .send({ quantity: 10 });

            expect(response.status).toBe(200);
            expect(response.body.quantity).toBe(40);
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(
                "Samsung GalaxyA54",
                10,
                undefined
            );

            jest.resetAllMocks();
        });
    });

    describe("GET /products", () => {
        test("should retrieve all products", async () => {
            const mockProducts: Product[] = [product];
            jest.spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(Authenticator.prototype, "isAdminOrManager")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(ProductController.prototype, "getProducts")
                .mockResolvedValueOnce(mockProducts);

            const response = await request(app)
                .get(baseURL + "/")
                .set("user", JSON.stringify(mockUser));

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockProducts);
            expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.getProducts).toHaveBeenCalledWith(
                undefined,
                undefined,
                undefined
            );

            jest.resetAllMocks();
        });
    });

    describe("GET /products/available", () => {
        test("should retrieve all available products", async () => {
            const mockProducts: Product[] = [product];
            jest.spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(Authenticator.prototype, "isCustomer")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(ProductController.prototype, "getAvailableProducts")
                .mockResolvedValueOnce(mockProducts);

            const response = await request(app)
                .get(baseURL + "/available")
                .set("user", JSON.stringify(mockUser));

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockProducts);
            expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith(
                undefined,
                undefined,
                undefined
            );

            jest.resetAllMocks();
        });
    });

    describe("DELETE /products", () => {
        test("should delete all products", async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(Authenticator.prototype, "isAdminOrManager")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(ProductController.prototype, "deleteAllProducts")
                .mockResolvedValueOnce(undefined);

            const response = await request(app)
                .delete(baseURL + "/")
                .set("user", JSON.stringify(mockUser));

            expect(response.status).toBe(200);
            expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);

            jest.resetAllMocks();
        });
    });

    describe("DELETE /products/:model", () => {
        test("should delete a product by model", async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(Authenticator.prototype, "isAdminOrManager")
                .mockImplementation((req, res, next) => next());

            jest.spyOn(ProductController.prototype, "deleteProduct")
                .mockResolvedValueOnce(undefined);

            const response = await request(app)
                .delete(baseURL + "/Samsung GalaxyA54")
                .set("user", JSON.stringify(mockUser));

            expect(response.status).toBe(200);
            expect(ProductController.prototype.deleteProduct).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.deleteProduct).toHaveBeenCalledWith("Samsung GalaxyA54");

            jest.resetAllMocks();
        });
    });
});
