import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750788929363 implements MigrationInterface {
    name = 'Migrations1750788929363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP CONSTRAINT "FK_103b3dd4b5c0ca304eac2b8b035"`);
        await queryRunner.query(`ALTER TABLE "article" RENAME COLUMN "brandId" TO "brand_id"`);
        await queryRunner.query(`ALTER TABLE "article" ADD CONSTRAINT "FK_56577cc6ad18a1116c6532f6456" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP CONSTRAINT "FK_56577cc6ad18a1116c6532f6456"`);
        await queryRunner.query(`ALTER TABLE "article" RENAME COLUMN "brand_id" TO "brandId"`);
        await queryRunner.query(`ALTER TABLE "article" ADD CONSTRAINT "FK_103b3dd4b5c0ca304eac2b8b035" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
