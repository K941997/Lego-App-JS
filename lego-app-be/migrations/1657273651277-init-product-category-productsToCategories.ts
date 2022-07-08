import { MigrationInterface, QueryRunner } from "typeorm";

export class initProductCategoryProductsToCategories1657273651277 implements MigrationInterface {
    name = 'initProductCategoryProductsToCategories1657273651277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "key" character varying NOT NULL, "slug" character varying NOT NULL, "name" character varying NOT NULL, "image" character varying NOT NULL, "price" integer NOT NULL, "description" character varying NOT NULL, "status" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_120ea9ee74ef0e0774629d448e4" PRIMARY KEY ("key"))`);
        await queryRunner.query(`CREATE TABLE "products-to-categories" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "id" SERIAL NOT NULL, "product_key" character varying NOT NULL, "category_key" character varying NOT NULL, CONSTRAINT "PK_4a645eebe53700c6f81c426533c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "key" character varying NOT NULL, "slug" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_7c82c39b0dc8ef1ba334eb615a3" PRIMARY KEY ("key"))`);
        await queryRunner.query(`ALTER TABLE "products-to-categories" ADD CONSTRAINT "FK_dd9ac12b8fde932e4308cb289bb" FOREIGN KEY ("product_key") REFERENCES "product"("key") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products-to-categories" ADD CONSTRAINT "FK_eec5407524b2ef70f6727b8747b" FOREIGN KEY ("category_key") REFERENCES "category"("key") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products-to-categories" DROP CONSTRAINT "FK_eec5407524b2ef70f6727b8747b"`);
        await queryRunner.query(`ALTER TABLE "products-to-categories" DROP CONSTRAINT "FK_dd9ac12b8fde932e4308cb289bb"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "products-to-categories"`);
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
