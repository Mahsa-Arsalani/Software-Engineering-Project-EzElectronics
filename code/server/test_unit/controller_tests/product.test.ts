import { test, expect, jest } from "@jest/globals"
import ProductController from "../../src/controllers/productController"
import ProductDAO from "../../src/dao/productDAO"
import { Product, Category } from "../../src/components/product"
import { ProductAlreadyExistsError, ProductNotFoundError, ProductSoldError, 
    LowProductStockError, EmptyProductStockError } from "../../src/errors/productError";
import { DateError } from "../../src/utilities";

jest.mock("../../src/dao/productDAO");
jest.mock("../../src/db/db");


afterEach(()=>{
    jest.resetAllMocks()
    jest.clearAllMocks()
})

describe("ProductController unit testing", ()=>{

    const testSmartphone = {
        sellingPrice: 50.00,
        model: "Samsung GalaxyA54",
        category: Category.SMARTPHONE,
        arrivalDate: null,
        details: null,
        quantity: 50
    }

    const testAppliance = {
        sellingPrice: 10.00,
        model: "Alexa",
        category: Category.APPLIANCE,
        arrivalDate: null,
        details: null,
        quantity: 20
    }

    const testLaptop = {
        sellingPrice: 200.00,
        model: "Hp PC",
        category: Category.LAPTOP,
        arrivalDate: null,
        details: null,
        quantity: 0
    }

    // Example of a unit test for the newModel method of the UserProduct
    // The test checks if the method returns undefined when the DAO method returns Promise<void>
    // The test also expects the DAO method to be called once with the correct parameters
    describe("createProduct test cases", ()=>{
        test("It should return undefined", async () => {
            jest.spyOn(ProductDAO.prototype, "newModel").mockResolvedValueOnce(undefined); //Mock the newModel method of the DAO
            const controller = new ProductController(); //Create a new instance of the controller
            //Call the registerProducts method of the controller with the test user object
            const response = await controller.registerProducts(testSmartphone.model, testSmartphone.category, testSmartphone.quantity, 
                testSmartphone.details, testSmartphone.sellingPrice, testSmartphone.arrivalDate);
        
            //Check if the newModel method of the DAO has been called once with the correct parameters
            expect(ProductDAO.prototype.newModel).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.newModel).toHaveBeenCalledWith(
                testSmartphone.model, 
                testSmartphone.category, 
                testSmartphone.quantity, 
                testSmartphone.details, 
                testSmartphone.sellingPrice, 
                testSmartphone.arrivalDate);
            expect(response).toBe(undefined); //Check if the response is undefined
        });
    });

    describe("changeProductQuantity test cases", ()=>{
        test("It should return 55", async() => {
            jest.spyOn(ProductDAO.prototype, "updateModel").mockResolvedValueOnce(55);
            const controller = new ProductController(); //Create a new instance of the controller
            //Call the changeProductQuantity method of the controller with the test user object
            const response = await controller.changeProductQuantity(testSmartphone.model, 5, null);
        
            //Check if the newModel method of the DAO has been called once with the correct parameters
            expect(ProductDAO.prototype.updateModel).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.updateModel).toHaveBeenCalledWith(
                testSmartphone.model, 5, null);
            expect(response).toBe(55); //Check if the response is the quantity, so 50, + 5
        });
    });

    describe("sellProduct test cases", ()=>{
        test("It should return 45", async() => {
            jest.spyOn(ProductDAO.prototype, "sellModel").mockResolvedValueOnce(45);
            const controller = new ProductController(); //Create a new instance of the controller
            //Call the sellProduct method of the controller with the test user object
            const response = await controller.sellProduct(testSmartphone.model, 5, null);
        
            //Check if the newModel method of the DAO has been called once with the correct parameters
            expect(ProductDAO.prototype.sellModel).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.sellModel).toHaveBeenCalledWith(
                testSmartphone.model, 5, null);
            expect(response).toBe(45); //Check if the response is the quantity, so 50, - 5
        });
    });

    describe("sellProduct test cases", ()=>{
        test("It should return 45", async() => {
            jest.spyOn(ProductDAO.prototype, "sellModel").mockResolvedValueOnce(45);
            const controller = new ProductController(); //Create a new instance of the controller
            //Call the sellProduct method of the controller with the test user object
            const response = await controller.sellProduct(testSmartphone.model, 5, null);
        
            //Check if the newModel method of the DAO has been called once with the correct parameters
            expect(ProductDAO.prototype.sellModel).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.sellModel).toHaveBeenCalledWith(
                testSmartphone.model, 5, null);
            expect(response).toBe(45); //Check if the response is the quantity, so 50, - 5
        });
    });

    describe("getProducts test cases", ()=>{
        test("it should resolve to a product list", async ()=>{
            const requested = [new Product( testSmartphone.sellingPrice, 
                testSmartphone.model, 
                testSmartphone.category, 
                testSmartphone.arrivalDate, 
                testSmartphone.details, 
                testSmartphone.quantity
                ), 
                new Product(testAppliance.sellingPrice, 
                testAppliance.model, 
                testAppliance.category, 
                testAppliance.arrivalDate, 
                testAppliance.details, 
                testAppliance.quantity),
                new Product(testLaptop.sellingPrice, 
                testLaptop.model, 
                testLaptop.category, 
                testLaptop.arrivalDate, 
                testLaptop.details, 
                testLaptop.quantity)];
            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce(requested);
            const controller = new ProductController();
            const response = await controller.getProducts(null, null, null);
            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalledTimes(1);
            expect(response).toEqual(requested)
        });
    });

    describe("getAvailableProducts test cases", ()=>{
        test("it should resolve to a product list", async ()=>{
            const requested = [new Product( testSmartphone.sellingPrice, 
                testSmartphone.model, 
                testSmartphone.category, 
                testSmartphone.arrivalDate, 
                testSmartphone.details, 
                testSmartphone.quantity
                ), 
                new Product(testAppliance.sellingPrice, 
                testAppliance.model, 
                testAppliance.category, 
                testAppliance.arrivalDate, 
                testAppliance.details, 
                testAppliance.quantity)];
            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce(requested);
            const controller = new ProductController();
            const response = await controller.getProducts(null, null, null);
            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalledTimes(1);
            expect(response).toEqual(requested)
        });
    });

    describe("deleteAllProdycts test cases", ()=>{
        test("It should return true", async () => {
            jest.spyOn(ProductDAO.prototype, "deleteAllProducts").mockResolvedValueOnce(true); //Mock the deleteAllProducts method of the DAO
            const controller = new ProductController(); //Create a new instance of the controller
            //Call the deleteProducts method of the controller with the test object
            const response = await controller.deleteAllProducts();
        
            //Check if the deleteAllProducts method of the DAO has been called once with the correct parameters
            expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledWith();
            expect(response).toBe(true); //Check if the response is true
        });
    });

    describe("deleteProduct test cases", ()=>{
        test("It should return true", async () => {
            jest.spyOn(ProductDAO.prototype, "deleteOneProduct").mockResolvedValueOnce(true); //Mock the deleteAllProducts method of the DAO
            const controller = new ProductController(); //Create a new instance of the controller
            //Call the deleteProduct method of the controller with the test object
            const response = await controller.deleteProduct(testAppliance.model);
        
            //Check if the deleteOneProduct method of the DAO has been called once with the correct parameters
            expect(ProductDAO.prototype.deleteOneProduct).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.deleteOneProduct).toHaveBeenCalledWith(testAppliance.model);
            expect(response).toBe(true); //Check if the response is true
        });
    });
});