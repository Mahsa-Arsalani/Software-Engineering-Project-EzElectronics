import { test, expect, jest } from "@jest/globals"
import ProductDAO from "../../src/dao/productDAO"
import db from "../../src/db/db"
import { Product, Category } from "../../src/components/product"
import { ProductAlreadyExistsError, ProductNotFoundError, ProductSoldError, 
    LowProductStockError, EmptyProductStockError } from "../../src/errors/productError";
import { DateError } from "../../src/utilities";
import { Database } from "sqlite3"

jest.mock("crypto")

afterEach(()=>{
    jest.restoreAllMocks()
    jest.clearAllMocks()
})

describe("ProductDAO unit testing", ()=>{

    const testProduct = {
        model: "prod",
        category: Category.SMARTPHONE,
        quantity: 50,
        details: "",
        sellingPrice: 50.00,
        arrivalDate: ""
    }

describe("createProduct test cases",()=>{
    test("It should resolve with undefined", async () => {
        const productDAO = new ProductDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null);
            return {} as Database;
        });
        const result = await productDAO.newModel(testProduct.model, testProduct.category, testProduct.quantity, 
            testProduct.details, testProduct.sellingPrice, testProduct.arrivalDate);
        expect(result).toBe(undefined);
        });

    test("It should throw an exception for non valid parameter - model", async () => {
        const productDAO = new ProductDAO();
    
        await expect(productDAO.newModel("", testProduct.category, testProduct.quantity, 
            testProduct.details, testProduct.sellingPrice, testProduct.arrivalDate)).rejects.toThrow(Error);
    
        const query = "SELECT COUNT(*) AS count FROM products";
        const result = await db.get(query);
        expect(result).toEqual({});
    });

    test("It should throw an exception for non valid parameter - category", async () => {
        const productDAO = new ProductDAO();
    
        await expect(productDAO.newModel(testProduct.model, "category", testProduct.quantity, 
            testProduct.details, testProduct.sellingPrice, testProduct.arrivalDate)).rejects.toThrow(Error);
    
        const query = "SELECT COUNT(*) AS count FROM products";
        const result = await db.get(query);
        expect(result).toEqual({});
    });

    test("It should throw an exception for non valid parameter - sellingPrice", async () => {
        const productDAO = new ProductDAO();
    
        await expect(productDAO.newModel(testProduct.model, testProduct.category, testProduct.quantity, 
            testProduct.details, -5, testProduct.arrivalDate)).rejects.toThrow(Error);
    
        const query = "SELECT COUNT(*) AS count FROM products";
        const result = await db.get(query);
        expect(result).toEqual({});
    });

    test("It should throw an exception for non valid parameter - date", async () => {
        const productDAO = new ProductDAO();
    
        await expect(productDAO.newModel(testProduct.model, testProduct.category, testProduct.quantity, 
            testProduct.details, testProduct.sellingPrice, "2050-01-01")).rejects.toThrow(DateError);
    
        const query = "SELECT COUNT(*) AS count FROM products";
        const result = await db.get(query);
        expect(result).toEqual({});
    });
});
});
