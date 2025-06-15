import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1749659949520 implements MigrationInterface {
    name = 'Migrations1749659949520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "warehouse_article" ("id" SERIAL NOT NULL, "stock" integer NOT NULL DEFAULT '0', "warehouseId" integer, "articleId" integer, CONSTRAINT "PK_c4255e76096edda678a99a8a88e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "warehouse_article" ADD CONSTRAINT "FK_6c274267d8dd6ce49cf4e3c59e2" FOREIGN KEY ("warehouseId") REFERENCES "warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "warehouse_article" ADD CONSTRAINT "FK_05175ae6d67c041347559454149" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouse_article" DROP CONSTRAINT "FK_05175ae6d67c041347559454149"`);
        await queryRunner.query(`ALTER TABLE "warehouse_article" DROP CONSTRAINT "FK_6c274267d8dd6ce49cf4e3c59e2"`);
        await queryRunner.query(`DROP TABLE "warehouse_article"`);
    }

}
