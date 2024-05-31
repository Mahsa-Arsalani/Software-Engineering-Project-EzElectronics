import db from "../db/db"
import { User} from "../components/user"
import { ExistingReviewError} from "../errors/reviewError";
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
addReview(model:string,user:User,score:number,comment:string):Promise<void>{
    return new Promise<void>((resolve,reject)=>{
        try{
            const checkSql = "SELECT COUNT(*) AS count FROM reviews WHERE user = ? AND model = ?";
            db.get(checkSql, [user, model], (err: Error | null, row: any) => {
                if (err) {
                    return reject(err);
                }
                if (row.count > 0) {
                    return reject(new ExistingReviewError());
                }
                const date = new Date().toISOString().split('T')[0];
                const insertsql="INSERT INTO reviews(user,model,score,date, comment) VALUES (?,?,?,?,?)";
            db.run(insertsql, [user,model,score,date,comment], (err: Error | null) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    } catch (error) {
        reject(error);
    }
});
}

}


export default ReviewDAO;