import db from "../db/db"
import {Cart, ProductInCart} from "../components/cart";
import {User, Role} from "../components/user";
import {CartNotFoundError, ProductInCartError, ProductNotInCartError, WrongUserCartError, EmptyCartError} from "../errors/cartError";
import {UserNotCustomerError} from "../errors/userError";
/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {
/**
 * Retrieves the current cart for a specific user.
 * @param user - The user for whom to retrieve the cart.
 * @returns A Promise that resolves to the user's cart or an empty one if there is no current cart.
 */
getCart(user: User) : Promise<Cart> {
    return new Promise<Cart>((resolve, reject) => {
        try {
            const username = user.username;
            const sql = "SELECT * FROM cart WHERE customer = ? AND paid = 0"
            db.get(sql, [username], (err: Error | null, row: any) => {
                if (err) 
                    reject(err)
                if (!row) {
                    reject(new CartNotFoundError);
                } else {
                    const cart: Cart = new Cart(row.customer, row.paid, row.paymentDate, row.total, row.products);
                    resolve(cart)
                }
            })
        } catch (error) {
            reject(error);
        }
    })
}   


/**
 * Adds a product to the user's cart. If the product is already in the cart, the quantity should be increased by 1.
 * If the product is not in the cart, it should be added with a quantity of 1.
 * If there is no current unpaid cart in the database, then a new cart should be created.
 * @param user - The user to whom the product should be added.
 * @param productId - The model of the product to add.
 * @returns A Promise that resolves to `true` if the product was successfully added.
 */
addToCart(user : User, product : string):Promise<Boolean>{
    return new Promise<Boolean>((resolve, reject)=>{
        const username = user.username;
        console.log(username);
        
        const unPaidSql = "SELECT * FROM cart WHERE customer = ? AND paid = 0 "

        db.get(unPaidSql, [username], (err: Error | null, row: any) => {
            if(row){
                  const array = JSON.parse(row.products);
                
                array.map((item:any) =>{
                    if(item.model == product){
                        // increase queantity by 1
                        const newProducts = array.map((item2:any)=>{
                            if(product == item2.model){
                                return {"model": item2.model,
                                    "quantity": item2.quantity + 1 ,
                                    "category": item2.category,
                                    "price": item2.price}
                            }else{
                                return item2
                            }
                        })
                        
                        const increaseSql = "UPDATE cart SET products = ? WHERE cartID = ?"
                        db.run(increaseSql, [JSON.stringify(newProducts), row.cartID], (err: Error | null, row: any) => {
                            if(err)
                                reject(err)
                            else resolve(true)
                        } )

                    }
                    else{
                        const array = JSON.parse(row.products);
                        const finedProduct = "SELECT * FROM products WHERE model = ?"
                        db.get(finedProduct,[product],(err: Error | null, row2: any) =>{
                            if (err){
                                reject(err)
                            }else{
                                array.push({
                                    "model": product,
                                    "category": row2.category,
                                    "price": row2.sellingPrice,
                                    "quantity": 1
                                })
                                    
                                const addProductSql =  "UPDATE cart SET products = ? WHERE cartID = ?"
                                db.run(addProductSql, [JSON.stringify(array), row.cartID], (err: Error | null, row: any) => {
                                    if(err)
                                        reject(err)
                                    else resolve(true)
                                } )
                            }
                                
                        })
                    }
                })
            }
            else{
                
                
                const array:any =[]
                const finedProduct = "SELECT * FROM products WHERE model = ?"
                db.get(finedProduct,[product],(err: Error | null, row2: any) =>{
                    if (err){
                        reject(err)
                    }else{
                        array.push({
                            "model": product,
                            "category": row2.category,
                            "price": row2.sellingPrice,
                            "quantity": 1
                        })
                            
                        const createCartSql = "INSERT INTO cart(customer, paid, paymentDate, total, products) VALUES(?,0,NULL,NULL,?)"
                        db.run(createCartSql,[username, JSON.stringify(array)],(err: Error | null, row: any) => {
                            if(err)
                                reject(err)
                            else resolve(true)
                        })
                    }
                        
                })
                // Create new cart with product
                
            }
        })
       

    })
}





/**
 * Checks out the user's cart. We assume that payment is always successful, there is no need to implement anything related to payment.
 * @param user - The user whose cart should be checked out.
 * @returns A Promise that resolves to `true` if the cart was successfully checked out.
 * 
 */
checkoutCart(user: User):Promise<Boolean>{
    return new Promise<Boolean>((resolve, reject)=>{
        try{
           
        } catch(error) {
            reject(error)
        }
    })
 }




/**
 * Retrieves all paid carts for a specific customer.
 * @param user - The customer for whom to retrieve the carts.
 * @returns A Promise that resolves to an array of carts belonging to the customer.
 * Only the carts that have been checked out should be returned, the current cart should not be included in the result.
 */
async getCustomerCarts(user: User):Promise<Cart[]> {
    return new Promise<Cart[]>((resolve, reject)=>{
        try{
            
        } catch(error) {
            reject(error)
        }
    })
} 




/**
 * Removes one product unit from the current cart. In case there is more than one unit in the cart, only one should be removed.
 * @param user The user who owns the cart.
 * @param product The model of the product to remove.
 * @returns A Promise that resolves to `true` if the product was successfully removed.
 */
removeProductFromCart(user: User, product: string):Promise<Boolean> {
    return new Promise<Boolean>((resolve, reject)=>{
        try{
            
        } catch(error) {
            reject(error)
        }
    })

}


/**
 * Removes all products from the current cart.
 * @param user - The user who owns the cart.
 * @returns A Promise that resolves to `true` if the cart was successfully cleared.
 */
clearCart(user: User):Promise<Boolean> { 
    return new Promise<Boolean>((resolve, reject)=>{
        try{
            
        } catch(error) {
            reject(error)
        }
    })
}






/**
 * Deletes all carts of all users.
 * @returns A Promise that resolves to `true` if all carts were successfully deleted.
 */
deleteAllCarts():Promise<Boolean> { 
    return new Promise((resolve, reject)=>{
        try{
            
        } catch(error) {
            reject(error)
        }
    })
}




/**
 * Retrieves all carts in the database.
 * @returns A Promise that resolves to an array of carts.
 */
getAllCarts():Promise<Cart[]> {
    return new Promise<Cart[]>((resolve, reject)=>{
        try{
            
        } catch(error) {
            reject(error)
        }
    })
 }




}

export default CartDAO