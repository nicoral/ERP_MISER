import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750089155147 implements MigrationInterface {
    name = 'Migrations1750089155147'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "permission" ADD "module" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "permission" DROP COLUMN "module"`);
    }

}
