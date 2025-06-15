import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1749947585326 implements MigrationInterface {
    name = 'Migrations1749947585326'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" ADD "birth_date" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "birth_date"`);
    }

}
