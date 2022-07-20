import { MigrationInterface, QueryRunner } from "typeorm";

export class initThemeRelationProduct1657786627592 implements MigrationInterface {
    name = 'initThemeRelationProduct1657786627592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "theme" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "key" character varying NOT NULL, "slug" character varying NOT NULL, "name" character varying NOT NULL, "image" character varying, "description" character varying, "enabled" integer NOT NULL DEFAULT '1', CONSTRAINT "UQ_5be2c2e7186ad7cbd83f94fb4de" UNIQUE ("name"), CONSTRAINT "PK_7b0e03a94450de6bb2114896b24" PRIMARY KEY ("key"))`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_1e5bc2ac4f3d1a8abd0fe9f9c84" FOREIGN KEY ("theme_key") REFERENCES "theme"("key") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_1e5bc2ac4f3d1a8abd0fe9f9c84"`);
        await queryRunner.query(`DROP TABLE "theme"`);
    }

}
