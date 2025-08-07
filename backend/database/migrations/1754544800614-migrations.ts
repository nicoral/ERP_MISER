import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1754544800614 implements MigrationInterface {
    name = 'Migrations1754544800614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD "retentionDocument" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP COLUMN "retentionDocument"`);
    }

}
