import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750523871011 implements MigrationInterface {
    name = 'Migrations1750523871011'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "code" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "serial" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "codeMine" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "parent_id" integer`);
        await queryRunner.query(`ALTER TABLE "cost_center" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD CONSTRAINT "FK_69173f296f56148250ed9599776" FOREIGN KEY ("parent_id") REFERENCES "cost_center"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cost_center" DROP CONSTRAINT "FK_69173f296f56148250ed9599776"`);
        await queryRunner.query(`ALTER TABLE "cost_center" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "parent_id"`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "codeMine"`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "serial"`);
        await queryRunner.query(`ALTER TABLE "cost_center" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "cost_center" ADD "name" character varying(100) NOT NULL`);
    }

}
