import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752812069936 implements MigrationInterface {
    name = 'Migrations1752812069936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement" ADD "inform" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "inform"`);
    }

}
