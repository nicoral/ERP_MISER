import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752082608241 implements MigrationInterface {
    name = 'Migrations1752082608241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP CONSTRAINT "FK_e0c9197cae0e1d8b17d2f5fba2d"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP COLUMN "supplier_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD "supplier_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD CONSTRAINT "FK_e0c9197cae0e1d8b17d2f5fba2d" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
