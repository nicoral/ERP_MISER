import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750817716282 implements MigrationInterface {
    name = 'Migrations1750817716282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" ADD "signature" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "signature"`);
    }

}
