import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752035087244 implements MigrationInterface {
    name = 'Migrations1752035087244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP CONSTRAINT "FK_f8087d2b14a26877a65a2cd0561"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP COLUMN "purchase_order_id"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "purchase_order_id_seq" OWNED BY "purchase_order"."id"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "id" SET DEFAULT nextval('"purchase_order_id_seq"')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "purchase_order_id_seq"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD "purchase_order_id" integer`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD CONSTRAINT "FK_f8087d2b14a26877a65a2cd0561" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
