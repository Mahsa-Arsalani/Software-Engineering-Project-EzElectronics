import { test, expect, jest } from "@jest/globals"
import ProductDAO from "../../src/dao/productDAO"
import db from "../../src/db/db"
import { Product, Category } from "../../src/components/product"
import { ProductAlreadyExistsError, ProductNotFoundError, ProductSoldError, 
    LowProductStockError, EmptyProductStockError } from "../../src/errors/productError";
import { DateError } from "../../src/utilities";
import { Database } from "sqlite3"

jest.mock('../../src/db/db');

afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
})

describe("ProductDAO unit testing", () => {
  let productDAO: ProductDAO;

  beforeEach(() => {
      productDAO = new ProductDAO();
  });

  const testProduct = {
      model: "prod",
      category: Category.SMARTPHONE,
      quantity: 50,
      details: "",
      sellingPrice: 50.00,
      arrivalDate: ""
  }

  const testErr = {
    model: "",
    category: "ciao",
    quantity: -5,
    details: "",
    sellingPrice: -3.00,
    arrivalDate: "2100-01-01"
  }

  describe("createProduct test cases", () => {
    test("It should resolve with undefined", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            // Run of the create table query
            callback(null, null);
            return {} as Database;
        }).mockImplementationOnce((sql, parameters, callback) => {
          // Run of the insert into query
          callback(null, null);
          return {} as Database;
        });

        await expect(productDAO.newModel(testProduct.model, testProduct.category, testProduct.quantity, 
            testProduct.details, testProduct.sellingPrice, testProduct.arrivalDate)).resolves.toBeUndefined();
  
        expect(mockDBRun).toHaveBeenCalledTimes(2);
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
    });

    test("It should reject - problem with creation of new table", async () => {
      const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
          // Run of the create table query
          throw new Error();
      }).mockImplementationOnce((sql, parameters, callback) => {
        // Run of the insert into query
        callback(null, null);
        return {} as Database;
      });

      await expect(productDAO.newModel(testProduct.model, testProduct.category, testProduct.quantity, 
          testProduct.details, testProduct.sellingPrice, testProduct.arrivalDate)).rejects.toBeInstanceOf(Error);

      expect(mockDBRun).toHaveBeenCalledTimes(1);
  });

  test("It should reject - Product already exist error", async () => {
    const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
        // Run of the create table query
        callback(null, null);
        return {} as Database;
    }).mockImplementationOnce((sql, parameters, callback) => {
      // Run of the insert into query
      throw new ProductAlreadyExistsError();
    });

    await expect(productDAO.newModel(testProduct.model, testProduct.category, testProduct.quantity, 
        testProduct.details, testProduct.sellingPrice, testProduct.arrivalDate)).rejects.toBeInstanceOf(ProductAlreadyExistsError);

    expect(mockDBRun).toHaveBeenCalledTimes(2);
    expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
  });
});

describe("updateModel test cases", () => {
  test('updateModel should update the model quantity and arrival date', async () => {
      const mockDBget = jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
          // Runs the query to obtain the old arrivalDate
          callback(null, { arrivalDate: '2023-01-01' });
          return {} as Database; 
      }).mockImplementationOnce((sql, params, callback) => {
        // Runs the query to obtain the new quantity
        callback(null, 55);
        return {} as Database; 
      });
      const mockDBRun = jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
        // Runs the query to update
        callback(null);
        return {} as Database;
      });

      await expect(productDAO.updateModel(testProduct.model, 5, testProduct.arrivalDate)).resolves.toEqual(55);
      expect(mockDBget).toBeCalledTimes(2);
      expect(mockDBRun).toBeCalledTimes(1);
      expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
  });

  test('updateModel - product not found error', async () => {
    const mockDBget = jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
        // Runs the query to obtain the old arrivalDate
        callback(new ProductNotFoundError());
        return {} as Database; 
    }).mockImplementationOnce((sql, params, callback) => {
      // Runs the query to obtain the new quantity
      callback(null, 55);
      return {} as Database; 
    });
    const mockDBRun = jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
      // Runs the query to update
      callback(null);
      return {} as Database;
    });

    await expect(productDAO.updateModel(testProduct.model, 5, testProduct.arrivalDate)).rejects.toBeInstanceOf(ProductNotFoundError);
    expect(mockDBget).toBeCalledTimes(1);
    expect(mockDBRun).toBeCalledTimes(0);
  });

  test('updateModel -  date input error 1', async () => {
    const mockDBget = jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
        // Runs the query to obtain the old arrivalDate
        callback(null, null);
        return {} as Database; 
    }).mockImplementationOnce((sql, params, callback) => {
      // Runs the query to obtain the new quantity
      callback(null, 55);
      return {} as Database; 
    });
    const mockDBRun = jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
      // Runs the query to update
      callback(null);
      return {} as Database;
    });

    await expect(productDAO.updateModel(testProduct.model, 5, testErr.arrivalDate)).rejects.toBeInstanceOf(DateError);
    expect(mockDBget).toBeCalledTimes(0);
    expect(mockDBRun).toBeCalledTimes(0);
  });

  test('updateModel - date input error 2', async () => {
    const mockDBget = jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
        // Runs the query to obtain the old arrivalDate
        callback(null, {arrivalDate : '2000-01-01'});
        return {} as Database; 
    }).mockImplementationOnce((sql, params, callback) => {
      // Runs the query to obtain the new quantity
      callback(null, 55);
      return {} as Database; 
    });
    const mockDBRun = jest.spyOn(db, 'run').mockImplementationOnce((sql, params, callback) => {
      // Runs the query to update
      callback(null);
      return {} as Database;
    });

    await expect(productDAO.updateModel(testProduct.model, 5, '1999-01-01')).rejects.toBeInstanceOf(DateError);
    expect(mockDBget).toBeCalledTimes(2);
    expect(mockDBRun).toBeCalledTimes(0);
  });
});

  test('sellModel should throw ProductNotFoundError if model does not exist', async () => {
      jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
          callback(null, null);
          return {} as Database; 
      });

      await expect(productDAO.sellModel('NonExistentModel', 1, null)).rejects.toThrow(ProductNotFoundError);
  });

  test('getAllProducts should return all products', async () => {
      const mockAll = jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
          callback(null, [
              { model: 'Model1', category: 'Laptop', quantity: 10, details: 'Details', sellingPrice: 1000, arrivalDate: '2023-01-01' },
          ]);
          return {} as Database;
      });

      const products = await productDAO.getAllProducts(null, null, null);

      expect(products.length).toBeGreaterThan(0);
      expect(mockAll).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
  });

  test('deleteOneProduct should delete a specific product', async () => {
      const mockRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
          callback(null);
          return {} as Database;
      });

      await expect(productDAO.deleteOneProduct('Model1')).resolves.toBe(true);

      expect(mockRun).toHaveBeenCalledWith(expect.any(String), ['Model1'], expect.any(Function));
  });
});
