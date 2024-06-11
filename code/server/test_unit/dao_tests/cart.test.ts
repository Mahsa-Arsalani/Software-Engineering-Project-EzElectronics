import { test, expect, jest ,afterEach, it, beforeAll, beforeEach, describe } from "@jest/globals"
import { User, Role} from "../../src/components/user";
import { Product, Category } from "../../src/components/product";
import { Cart, ProductInCart } from "../../src/components/cart";

import cartDAO from "../../src/dao/cartDAO"
import db from "../../src/db/db"
import { DateError } from "../../src/utilities";
import { Database } from "sqlite3"
import CartDAO from "../../src/dao/cartDAO";

jest.mock("crypto")

afterEach(()=>{
    jest.restoreAllMocks()
    jest.clearAllMocks()
})

describe('createCurrentCart', () => {

    const mockUser = new User("tusername","tname","tsurname", Role.CUSTOMER , "taddress", "10-10-1999");
    const product = new Product(50.0, "Samsung GalaxyA54", Category.SMARTPHONE, "", "", 50);
    const mockCart = new Cart("tcustomer", true, "11-06-2024", 10, [{model:"Samsung GalaxyA54", quantity: 10, category: Category.SMARTPHONE, price: 50.00 }]);


    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should resolve true when cart is created successfully', async () => {
      jest.spyOn(db,"run").mockImplementation((sql,params,callback)=>{
        if(sql.includes("INSERT INTO cart(customer, paid, paymentDate, total, products) VALUES(?,0,NULL,?,?)")){
           return callback(null)
        }
      })

      const result = await CartDAO.prototype.createCurrentCart(mockUser,mockCart)
      expect(result).toBe(true)
      expect(db.run).toHaveBeenCalledTimes(1)
      jest.clearAllMocks()
    });


   
    
});