import { test, expect, jest } from "@jest/globals"
import ProductController from "../../src/controllers/productController"
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

describe("createUser test cases",()=>{
    test("It should resolve true", async () => {
        const productDAO = new ProductDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null);
            return {} as Database;
        });
        const result = await productDAO.newModel(testProduct.model, testProduct.category, testProduct.quantity, 
            testProduct.details, testProduct.sellingPrice, testProduct.arrivalDate);
        expect(result).toBe(undefined);
        });
    });
    
});
