import db from "../db/db"
import { Cart, ProductInCart} from "../components/cart";
import {User, Role} from "../components/user";
import {CartNotFoundError, ProductInCartError, ProductNotInCartError, WrongUserCartError, EmptyCartError} from "../errors/cartError";
import {UserNotCustomerError} from "../errors/userError";
/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {
     /**
     * Returns the current cart of the logged in user whose role is Customer
     * @param user - The logged-in user.
     * @returns A Promise that resolves to a Cart object.
     */
    getCurrentCart(user: User): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {

                if(user.role!== Role.CUSTOMER) {
                    reject(new UserNotCustomerError);
                }

                const username = user.username;
                const sql = "SSELECT * FROM cart WHERE customer = ? AND paid = 0"
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
                reject(error)
            }

        });
    }   




}

export default CartDAO