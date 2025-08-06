import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1754502366981 implements MigrationInterface {
    name = 'Migrations1754502366981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service" ADD "default_supplier_id" integer`);
        await queryRunner.query(`ALTER TABLE "service" ADD CONSTRAINT "FK_ea6f6d8603919f55478de816e3a" FOREIGN KEY ("default_supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service" DROP CONSTRAINT "FK_ea6f6d8603919f55478de816e3a"`);
        await queryRunner.query(`ALTER TABLE "service" DROP COLUMN "default_supplier_id"`);
    }

}
