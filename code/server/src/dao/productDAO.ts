import db from "../db/db";
import { Category, Product } from "../components/product";
import dayjs from 'dayjs';
import { ProductAlreadyExistsError, ProductNotFoundError, LowProductStockError, EmptyProductStockError } from "../errors/productError";
import { DateError } from "../utilities";

/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {

    /** 
     * It creates a new model in the products table. If the products table doesn't exist, it will create it and put the new model in. 
     * It doesn't return anything
     */
    newModel(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null): Promise<void> {
        return new Promise((resolve, reject) => {

            // Verify the date
            if (arrivalDate === null) arrivalDate = dayjs().format("YYYY-MM-DD");
            else if (dayjs(arrivalDate).isAfter(dayjs())) return reject(new DateError());
            
            // Create table if it doesn't exist
            const createTableSql = 
                `CREATE TABLE IF NOT EXISTS products (
                model TEXT PRIMARY KEY,
                category TEXT,
                quantity INTEGER,
                details TEXT,
                sellingPrice REAL,
                arrivalDate TEXT)`;

            // Runs the query
            if (model.length == 0 || 
                !(category === Category.APPLIANCE || category === Category.LAPTOP || category === Category.SMARTPHONE) ||
            sellingPrice <= 0)
                reject(new Error());
            this.runSql(createTableSql)
                .then(() => {
                    const insertSql = "INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES (?, ?, ?, ?, ?, ?)";
                    return this.runSql(insertSql, [model, category, quantity, details, sellingPrice, arrivalDate]);
                })
                .then(resolve)
                .catch(err => {
                    reject(new ProductAlreadyExistsError());
                });
        });
    }

    /** 
     * It updates a model's quantity and/or arrival date.
     * The number to use as quantity is not the new quantity but the increment to add to the old one.
     * It return the new quantity available
     */
    updateModel(model: string, quantity: number, arrivalDate: string | null): Promise<number> {
        return new Promise((resolve, reject) => {

            // Checks the date
            if (arrivalDate === null) arrivalDate = dayjs().format("YYYY-MM-DD");
            else if (dayjs(arrivalDate).isAfter(dayjs())) return reject(new DateError());

            const sql = "SELECT arrivalDate FROM products WHERE model = ?";
            this.getSql(sql, [model])
                .then((row: { arrivalDate: string }) => {
                    if (!row) return reject(new ProductNotFoundError());
                    if (dayjs(arrivalDate).isBefore(dayjs(row.arrivalDate))) return reject(new DateError());
                    arrivalDate = dayjs(arrivalDate).format("YYYY-MM-DD");

                    const updateSql = "UPDATE products SET quantity = quantity + ?, arrivalDate = ? WHERE model = ?";
                    return this.runSql(updateSql, [quantity, arrivalDate, model]);
                })
                .then(() =>{
                    const sqlnewquantity = "SELECT quantity FROM products WHERE model = ?";
                    const newquantity = this.getSql(sqlnewquantity, [model])
                resolve(newquantity)})
               .catch(err => {
                    reject(err);
                });
            });
        }

    /** 
     * It allows selling products. Model is the name of the model sold, quantity is the number of products sold, selling date is
     * the date when it happened. If the selling date is null, the date used is the one of today.
     * It returns the number of products remaining.
     */
    sellModel(model: string, quantity: number, sellingDate: string | null): Promise<number> {
        return new Promise((resolve, reject) => {

            // Checks the date
            if (sellingDate === null) sellingDate = dayjs().format("YYYY-MM-DD");
            else if (dayjs(sellingDate).isAfter(dayjs())) return reject(new DateError());

            const sql = "SELECT arrivalDate, quantity FROM products WHERE model = ?";
            this.getSql(sql, [model])
                .then((row: { arrivalDate: string, quantity: number }) => {
                    if (!row) return reject(new ProductNotFoundError());
                    if (dayjs(sellingDate).isBefore(dayjs(row.arrivalDate))) return reject(new DateError());
                    if (row.quantity === 0) return reject(new EmptyProductStockError());
                    if (row.quantity < quantity) return reject(new LowProductStockError());

                    const updateSql = "UPDATE products SET quantity = quantity - ?, arrivalDate = ? WHERE model = ?";
                    return this.runSql(updateSql, [quantity, sellingDate, model]).then(() => resolve(row.quantity - quantity));
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    /** 
     * It gets all the products. They can be filtered by category (one between "Smartphone", "Laptop", "Appliance") or by model. If so,
     * "grouping" should be equal to the word "category" or "model"
     */
    getAllProducts(grouping: string | null, category: string | null, model: string | null): Promise<Product[]> {
        return new Promise((resolve, reject) => {
            try {
                let sql = "SELECT * FROM products";
                let params: any[] = [];

                // Checks errors and sets query parameters
                if (grouping) {
                    if (grouping === "category" && category && !model) {
                        sql += " WHERE category = ?";
                        params = [category];
                    } else if (grouping === "model" && model && !category) {
                        sql += " WHERE model = ?";
                        params = [model];
                    } else {
                        return reject(new Error("Invalid parameters"));
                    }
                } else {
                    if (model || category) {
                        return reject(new Error("Invalid parameters"));
                    }
                }

                // Runs the query
                this.allSql(sql, params)
                    .then((rows) => {
                        if (rows.length === 0 && model) return reject(new ProductNotFoundError());
                        resolve(rows);
                    })
                    .catch(err => {
                        reject(err);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Delete all the rows of the table: product, product_history
     */
    deleteAllProducts(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                const sqlDeleteProducts = "DELETE FROM products";
                this.runSql(sqlDeleteProducts)
                    .then(() => resolve(true))
                    .catch(err => {
                        reject(err);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    /** 
     * It deletes a specific product from the products table based on the model.
     * It also deletes the corresponding entries from the products_history table.
     * It returns true if the operation is successful.
     */
    deleteOneProduct(model: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                const sql = "DELETE FROM products WHERE model = ?";
                this.runSql(sql, [model])
                    .then(() => resolve(true))
                    .catch(err => {
                        reject(err);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    getProductByModel(model: string): Promise<Product>{
        return new Promise<Product>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM products WHERE model = ?"
                db.get(sql, [model], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    if (!row) {
                        reject(new ProductNotFoundError())
                        return
                    }
                    const user: Product = new Product(row.sellingPrice, row.model, row.category, row.arrivalDate, row.details, row.quantity)
                    resolve(user)
                })
            } catch (error) {
                reject(error)
            }

        })
    }

    // It runs an SQL query that doesn't return anything (like insert, update, delete).
    private runSql(sql: string, params?: any[]): Promise<void> {
        return new Promise((resolve, reject) => {
            db.run(sql, params, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // It runs an SQL query that returns a single row (used to get information by model, for ex.)
    private getSql(sql: string, params?: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // It runs an SQL query that returns all the rows queried
    private allSql(sql: string, params?: any[]): Promise<any[]> {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

export default ProductDAO;
