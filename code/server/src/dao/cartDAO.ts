import db from "../db/db"
import {Cart} from "../components/cart";
import {User} from "../components/user";
import {CartNotFoundError, EmptyCartError, ProductNotInCartError} from "../errors/cartError";
import { Product } from "../components/product";
import { ProductInCart } from "../components/cart";
import dayjs from 'dayjs';

/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {

/**
 * Adds a product to the user's cart. If the product is already in the cart, the quantity should be increased by 1.
 * If the product is not in the cart, it should be added with a quantity of 1.
 * If there is no current unpaid cart in the database, then a new cart should be created.
 * @param user - The user to whom the product should be added.
 * @param productId - The model of the product to add.
 * @returns A Promise that resolves to `true` if the product was successfully added.
 */
/*
//Moved this login in the contrtoller

addToCart(user : User, product : Product):Promise<Boolean>{
    return new Promise<Boolean>((resolve, reject)=>{
        const username = user.username;
        const unPaidSql = "SELECT * FROM cart WHERE customer = ? AND paid = 0"
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
                        db.run(increaseSql, [JSON.stringify(newProducts), row.cartID], (err: Error | null) => {
                            if(err)
                                reject(err)
                            else resolve(true)
                        } )

                    }
                    else{
                        const array = JSON.parse(row.products);
                        const findProduct = "SELECT * FROM products WHERE model = ?"
                        db.get(findProduct,[product],(err: Error | null, row2: any) =>{
                            if (err){
                                reject(err)
                            }else{
                                array.push({
                                    "model": product,
                                    "quantity": 1,
                                    "category": row2.category,
                                    "price": row2.sellingPrice   
                                })
                                    
                                const addProductSql =  "UPDATE cart SET products = ? WHERE cartID = ?"
                                db.run(addProductSql, [JSON.stringify(array), row.cartID], (err: Error | null) => {
                                    if(err)
                                        reject(err)
                                    else resolve(true)
                                } )
                            }
                                
                        })
                    }
                })
            }

            // Create new cart with product
            else{   
                const products = [{
                    "model": product.model,
                    "quantity": 1,
                    "category": product.category,
                    "price": product.sellingPrice
                }]

                const createCartSql = "INSERT INTO cart(customer, paid, paymentDate, total, products) VALUES(?,0,NULL,?,?)"
                db.run(createCartSql,[username, product.sellingPrice, JSON.stringify(products)],(err: Error | null, row: any) => {
                    if(err) reject(err)
                    else resolve(true)
                })

                /*
                const array:any =[]
                const findProduct = "SELECT * FROM products WHERE model = ?"
                db.get(findProduct,[product],(err: Error | null, row2: any) =>{
                    if (err){
                        reject(err)
                    }else{ 
                        array.push({
                            "model": product,
                            "quantity": 1,
                            "category": row2.category,
                            "price": row2.sellingPrice
                        })     
                        const createCartSql = "INSERT INTO cart(customer, paid, paymentDate, total, products) VALUES(?,0,NULL,NULL,?)"
                        db.run(createCartSql,[username, JSON.stringify(array)],(err: Error | null, row: any) => {
                            if(err)
                                reject(err)
                            else resolve(true)
                        })
                    }
                        
                })  
                            
            }
        })
       

    })
}

*/

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
                if (err){
                    reject(err);   
                }

                if(row){
                    const cart: Cart = new Cart(row.customer, row.paid, row.paymentDate, row.total, JSON.parse(row.products));
                    resolve(cart)
                }else{
                    const cart: Cart = new Cart(username, false, null, 0, []);
                    cart.setExist(false)
                    resolve(cart)
                }       
            })
        } catch (error) {
            reject(error);
        }
    })
}   



/**
 * Checks out the user's cart. We assume that payment is always successful, there is no need to implement anything related to payment.
 * @param user - The user whose cart should be checked out.
 * @returns A Promise that resolves to `true` if the cart was successfully checked out.
 */
checkoutCart(user: User):Promise<Boolean>{
    return new Promise<Boolean>((resolve, reject)=>{
        try{
            //Moved this logic in the controller
            //const username = user.username;
            //const sql = "SELECT * FROM cart WHERE customer = ? AND paid = 0";
            //db.get(sql, [username], (err:Error | null, row: any) =>{
            
                    //if(row.products){
            const sql = "UPDATE cart SET paymentDate = ?, paid = 1 WHERE customer = ? AND paid = 0"
            db.run(sql, [dayjs().format("YYYY-MM-DD"), user.username], (err:Error | null, row: any) => {
                if(err) reject(err)
                else resolve(true)
            })
                    //}if(!row.products){
                    //    reject (new EmptyCartError)
                    //}    
            //})  
              
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
getCustomerCarts(user: User):Promise<Cart[]> {
    return new Promise<Cart[]>((resolve, reject)=>{
        try{
            const username = user.username;
            const sql = "SELECT * FROM cart WHERE customer = ? AND paid = 1"
            db.all(sql, [username], (err:Error | null, rows: any) => {
                if(err) {
                    reject(err);
                    return
                }
                if (!rows) {
                    reject(new CartNotFoundError());
                }
                const carts: Cart[] = rows.map((row:any) => new Cart(row.customer, row.paid, row.paymentDate, row.total, row.products));
                resolve(carts);
            })
            
        } catch(error) {
            reject(error)
        }
    })
} 


updateCurrentCart(user: User, cart: Cart): Promise<Boolean>{
    return new Promise<Boolean>((resolve, reject)=>{
        try{
            const updateCart = "UPDATE cart SET paymentDate = ?, total = ?, products = ? WHERE customer = ? AND paid = 0"
            db.run(updateCart, [cart.paymentDate, cart.total, JSON.stringify(cart.products), user.username], (err: Error | null) => {
                if(err) reject(err)
                else resolve(true)
            })
        }
        catch(err){
            reject(err)
        }
    })
}

createCurrentCart(user: User, cart: Cart): Promise<Boolean>{
    return new Promise<Boolean>((resolve, reject)=>{
        try{
            const createCartSql = "INSERT INTO cart(customer, paid, paymentDate, total, products) VALUES(?,0,NULL,?,?)"
                db.run(createCartSql,[user.username, cart.total, JSON.stringify(cart.products)],(err: Error | null, row: any) => {
                    if(err) reject(err)
                    else resolve(true)
                })
        }
        catch(err){
            reject(err)
        }
    })
}

/**
 * Removes one product unit from the current cart. In case there is more than one unit in the cart, only one should be removed.
 * @param user The user who owns the cart.
 * @param product The model of the product to remove.
 * @returns A Promise that resolves to `true` if the product was successfully removed.
 */

// It requires the model of the product to remove. the product must exist in the current cart
/*

//Moved this logic in the controller

removeProductFromCart(user: User, product: Product):Promise<Boolean> {
    return new Promise<Boolean>((resolve, reject)=>{

        const username = user.username;
        const currentCartSql = "SELECT * FROM cart WHERE customer = ? AND paid = 0"
        db.get(currentCartSql, [username], (err: Error | null, row: any) => {
            if(row){
                const array = JSON.parse(row.products);
                array.map((item:any) =>{
                    if(item.model == product && item.quantity >= 2){
                        
                            const newProducts = array.map((item2:any)=>{
                                // decrease queantity by 1
                                if(product == item2.model){
                                    return {"model": item2.model,
                                            "quantity": item2.quantity - 1 ,
                                            "category": item2.category,
                                            "price": item2.price}
                                }
                                else{
                                    return item2
                                }
                            })
                            const updateCart = "UPDATE cart SET products = ? WHERE cartID = ?"
                            db.run(updateCart, [JSON.stringify(newProducts), row.cartID], (err: Error | null) => {
                            if(err)
                                reject(err)
                            else resolve(true)
                        } )
                    }
                    if(item.model == product && item.quantity <= 1){
                                 // delete the product 
                                const newProducts = array.filter((item:any)=>{item !== item.model });
                                const updateCart =  "UPDATE cart SET products = ? WHERE cartID = ?"
                                db.run(updateCart, [JSON.stringify(newProducts), row.cartID], (err: Error | null) => {
                                    if(err)
                                        reject(err)
                                    else resolve(true)
                                })
                            }
                                
                    })
                }
               

            else{
                reject(new CartNotFoundError)
            }
        })
            
            
    })*/

        /*return new Promise<Boolean>((resolve, reject) => {
            const username = user.username;
            const currentCartSql = "SELECT * FROM cart WHERE customer = ? AND paid = 0";
        
            db.get(currentCartSql, [username], (err: Error | null, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }
        
                if (row) {
                    let productsArray = JSON.parse(row.products);
                    let productFound = false;
        
                    productsArray = productsArray.map((item: any) => {
                        if (item.model === product) {
                            item.quantity -= 1;
                            productFound = true;
                        }
                        return item;
                    }).filter((item: any) => item.quantity > 0);
        
                    if (productFound) {
                        const updateCartSql = "UPDATE cart SET products = ? WHERE cartID = ?";
                        db.run(updateCartSql, [JSON.stringify(productsArray), row.cartID], (err: Error | null) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(true);
                            }
                        });
                    } else {
                        // Product was not found, no update needed
                        resolve(false); 
                    }
                } else {
                    // No cart found for the user
                    resolve(false);
                }
            });
        });
        
}*/




/**
 * Removes all products from the current cart.
 * @param user - The user who owns the cart.
 * @returns A Promise that resolves to `true` if the cart was successfully cleared.
 */
clearCart(user: User):Promise<Boolean> { 
    return new Promise<Boolean>((resolve, reject)=>{
        try{
            const username = user.username;
            const sql = "UPDATE cart SET products = ? WHERE customer = ? paid = 0";
            db.run(sql, [[], username], (err:Error | null) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(true)
                }
            }) 
            
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
    return new Promise<Boolean>((resolve, reject)=>{
        try{
            const sql = "DELETE FROM cart";
            db.run(sql, (err:Error | null) => {
                if(err) {
                    reject(err);
                }
                resolve(true);
            })   
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
            const sql = "SELECT * FROM cart"
            db.all(sql, (err:Error | null, rows: any) => {
                if(err) {
                    reject(err);
                    return
                }if(!rows) {
                    reject (new CartNotFoundError)
                    return
                } else {
                    const carts: Cart[] = rows.map((row:any) => new Cart(row.customer, row.paid, row.paymentDate, row.total, row.products));
                    resolve(carts)
                }
            })           
        } catch(error) {
            reject(error)
        }
    })
 }




}



export default CartDAO