import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750711510713 implements MigrationInterface {
    name = 'Migrations1750711510713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement" ADD "costCenterSecondaryId" integer`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "warehouseId" integer`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD CONSTRAINT "FK_95ddafe197e93e91ec721542f16" FOREIGN KEY ("costCenterSecondaryId") REFERENCES "cost_center"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD CONSTRAINT "FK_9a4775449ace585d3a992928a08" FOREIGN KEY ("warehouseId") REFERENCES "warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement" DROP CONSTRAINT "FK_9a4775449ace585d3a992928a08"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP CONSTRAINT "FK_95ddafe197e93e91ec721542f16"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "warehouseId"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "costCenterSecondaryId"`);
    }

}
