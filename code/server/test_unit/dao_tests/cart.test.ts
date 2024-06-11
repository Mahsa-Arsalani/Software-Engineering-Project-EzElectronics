import { test, expect, jest ,afterEach, beforeEach, describe } from "@jest/globals"
import { User, Role} from "../../src/components/user";
import { Product, Category } from "../../src/components/product";
import { Cart } from "../../src/components/cart";
import CartDAO from "../../src/dao/cartDAO";
import db from "../../src/db/db"
import { Database } from "sqlite3"


jest.mock("crypto")
jest.mock("../../src/db/db.ts")


afterEach(()=>{
    jest.restoreAllMocks()
    jest.clearAllMocks()
})


describe("CartDAO unit testing", ()=>{

    const mockUser = new User("tusername","tname","tsurname", Role.CUSTOMER , "taddress", "10-10-1999");
    const mockproduct = new Product(50.0, "Samsung GalaxyA54", Category.SMARTPHONE, "", "", 50);
    const mockCart = new Cart("tcustomer", true, "11-06-2024", 10, [{model:"Samsung GalaxyA54", quantity: 10, category: Category.SMARTPHONE, price: 50.00 }]);



    describe('createCurrentCart', () => {
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







    

})