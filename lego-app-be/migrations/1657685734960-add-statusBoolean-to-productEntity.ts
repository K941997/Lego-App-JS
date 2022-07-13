import { MigrationInterface, QueryRunner } from "typeorm";

export class addStatusBooleanToProductEntity1657685734960 implements MigrationInterface {
    name = 'addStatusBooleanToProductEntity1657685734960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "status" character varying NOT NULL DEFAULT 'Available'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "status"`);
    }

}
