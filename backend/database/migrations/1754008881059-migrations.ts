import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1754008881059 implements MigrationInterface {
    name = 'Migrations1754008881059'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement" ADD "subType" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "subType"`);
    }

}
