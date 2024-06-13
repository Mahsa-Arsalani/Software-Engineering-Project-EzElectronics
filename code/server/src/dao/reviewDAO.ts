import db from "../db/db"
import { User} from "../components/user"
import { ProductReview} from "../components/review"
import { ExistingReviewError, NoReviewProductError} from "../errors/reviewError";
import { ProductNotFoundError } from "../../src/errors/productError";
/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ReviewDAO {
/**
     * Adds a new review for a product
     * @param model The model of the product to review
     * @param user The username of the user who made the review
     * @param score The score assigned to the product, in the range [1, 5]
     * @param comment The comment made by the user
     * @returns A Promise that resolves to nothing
     */

    initReviewDB():Promise<Boolean>{
        return new Promise<Boolean>((resolve,reject)=>{
            const createTableSql = 
                `CREATE TABLE IF NOT EXISTS reviews (
                model TEXT,
                user TEXT,
                score INTEGER,
                date TEXT
                comment TEXT
                PRIMARY KEY(model,user))`;
                
            // Runs the query
            db.run(createTableSql, [], (err: Error | null) => { 
                if(err)
                    reject(err)
                resolve(true)
            });
        });
    }
deleteTable(): Promise<Boolean> {
    return new Promise<Boolean>((resolve, reject) => {
        const sql = "DROP TABLE reviews"
            db.run(sql, [], (err: Error | null) => {
                if(err)
                    reject(err)
                resolve(true)
            })
    })
}
        
addReview(model:string,user:User,score:number,comment:string):Promise<void>{
    return new Promise<void>((resolve,reject)=>{
        try{
            console.log("A")
            const checkSql1 = "SELECT model FROM products WHERE model = ?";
            db.get(checkSql1, [model], (err: Error | null, row: any) => {
                if (err) {
                    console.log("MUST NOT BE HERE1")
                    reject(err);
                }
                if (row) {  
                    console.log("B")
                    const checkSql2 = "SELECT * FROM reviews WHERE model = ? and user = ?";
                    db.get(checkSql2, [model,user.username], (err: Error | null, row: any) => {
                        if (err) {
                            console.log("MUST NOT BE HERE2")
                            reject(err);
                        }
                        if (row) {
                            reject(new ExistingReviewError());
                        }
                        else{
                            console.log("C")
                            let date = new Date().toISOString().split('T')[0];
                            const insertsql="INSERT INTO reviews(model,user,score,date,comment) VALUES(?,?,?,?,?)";
                            db.run(insertsql, [model,user.username,score,date,comment], (err: Error | null) => {
                                if (err) {
                                    console.log("MUST NOT BE HERE3")
                                    console.log(err.message)
                                    reject(err);
                                } 
                                else{  
                                    console.log("D")
                                    resolve();
                                }
                            });
                        }
                    });
                }
                else throw new ProductNotFoundError();
            });
        } catch (error) {
            console.log("MUST NOT BE HERE4")
            reject(error);
        }    
    });
}
 /**
     * Returns all reviews for a product
     * @param model The model of the product to get reviews from
     * @returns A Promise that resolves to an array of ProductReview objects
     */
getProductReviews(model: string):Promise<ProductReview[]>{ 
    return new Promise<ProductReview[]>((resolve,reject)=>{
        try{
            const sql="SELECT * FROM reviews WHERE model = ?";
            db.all(sql,[model], (err:Error | null,rows: any)=> {
                if (err) {
                    reject(err);
                    return
                }
                if(!rows){
                    reject(new NoReviewProductError());
                    return
                }
                const reviews: ProductReview[] = rows.map((row:any) =>new ProductReview(row.model, row.user, row.score, row.date, row.comment));
                resolve(reviews);
            })
        } catch (error){
            reject(error);
        }
    })
 }
 /**
     * Deletes the review made by a user for a product
     * @param model The model of the product to delete the review from
     * @param user The user who made the review to delete
     * @returns A Promise that resolves to nothing
     */
 deleteReview(model: string, user: User) :Promise<void>{
    return new Promise<void>((resolve,reject)=>{
        try{
            const checkSql1 = "SELECT model FROM products WHERE model = ?";
            db.get(checkSql1, [model], (err: Error | null, row: any) => {
                if (err) {
                    reject(err);
                }
                if (row) {
                    const checkSql2 = "SELECT * FROM reviews WHERE model = ? and user = ?";
                    db.get(checkSql2, [model,user.username], (err: Error | null, row: any) => {
                        if (err) {
                            reject(err);
                        }
                        if (row) {
                            const sql = "DELETE FROM reviews WHERE model= ? AND user= ?";
                            db.run(sql,[model,user.username],(err:Error | null) =>{
                                if(err) {
                                    reject(err);
                                }
                                resolve();
                            });
                        }
                        else throw new NoReviewProductError
                    });
                }
                else throw new ProductNotFoundError();
            });    
        } catch(error){
            reject(error);
        }
    });
}
 /**
     * Deletes all reviews for a product
     * @param model The model of the product to delete the reviews from
     * @returns A Promise that resolves to nothing
     */
 deleteReviewsOfProduct(model: string) :Promise<void> {
    return new Promise<void>((resolve,reject)=>{
        try{
            const checkSql = "SELECT model FROM products WHERE model = ?";
            db.get(checkSql, [model], (err: Error | null, row: any) => {
                if (err) {
                    reject(err);
                }
                if (row) {
                    const sql = "DELETE FROM reviews WHERE model= ?";
                    db.run(sql,[model],(err:Error | null) =>{
                        if(err) {
                            reject(err);
                        }
                        resolve();
                    })
                }
                else throw new ProductNotFoundError();
            });
        } catch(error){
            reject(error);
        }
    })
}
/**
* Deletes all reviews of all products
* @returns A Promise that resolves to nothing
*/
deleteAllReviews() :Promise<void> {
    return new Promise<void>((resolve,reject)=>{
        try{
            const sql = "DELETE FROM reviews";
            db.run(sql,(err:Error | null) =>{
                if(err) {
                    reject(err);
                }
                resolve();
            })
        } catch(error){
            reject(error);
        }
    })
}
}


export default ReviewDAO;