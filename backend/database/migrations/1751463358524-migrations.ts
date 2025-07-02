import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751463358524 implements MigrationInterface {
    name = 'Migrations1751463358524'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement" ADD "rejectedReason" character varying`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "rejectedBy" integer`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "rejectedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "rejectedAt"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "rejectedBy"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "rejectedReason"`);
    }

}
