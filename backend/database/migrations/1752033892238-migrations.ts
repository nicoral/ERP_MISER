import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752033892238 implements MigrationInterface {
    name = 'Migrations1752033892238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_1fdd0d65d22a9a9b3d43d7392d1"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_790c68f2cf2b6c7f951dc49a6b9"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_ace1ddccb58fe6d09b673d0b0f3"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_c7c72ac243b02488e21c6e1ee4c"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_d16a885aa88447ccfd010e739b0"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP CONSTRAINT "FK_9fe3d8085ef37c4f8a5543b9e3e"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" RENAME COLUMN "payment_group_id" TO "purchase_order_id"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "purchase_order_id_seq" OWNED BY "purchase_order"."id"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "id" SET DEFAULT nextval('"purchase_order_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_203bfa8208fc3742a7d04b06cc9" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_3dacab5c4a43cecc0e48f5edb12" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_3be9cd04f1379868b39b574c34c" FOREIGN KEY ("created_by_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_0c704575470010921b052e2255a" FOREIGN KEY ("requirement_id") REFERENCES "requirement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_0e21c6fef35dc9044f4e0c3fcca" FOREIGN KEY ("cost_center_id") REFERENCES "cost_center"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD CONSTRAINT "FK_f8087d2b14a26877a65a2cd0561" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_detail" DROP CONSTRAINT "FK_f8087d2b14a26877a65a2cd0561"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_0e21c6fef35dc9044f4e0c3fcca"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_0c704575470010921b052e2255a"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_3be9cd04f1379868b39b574c34c"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_3dacab5c4a43cecc0e48f5edb12"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_203bfa8208fc3742a7d04b06cc9"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "id" SET DEFAULT nextval('purchase_orders_id_seq')`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "purchase_order_id_seq"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" RENAME COLUMN "purchase_order_id" TO "payment_group_id"`);
        await queryRunner.query(`ALTER TABLE "payment_detail" ADD CONSTRAINT "FK_9fe3d8085ef37c4f8a5543b9e3e" FOREIGN KEY ("payment_group_id") REFERENCES "payment_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_d16a885aa88447ccfd010e739b0" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_c7c72ac243b02488e21c6e1ee4c" FOREIGN KEY ("requirement_id") REFERENCES "requirement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_ace1ddccb58fe6d09b673d0b0f3" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_790c68f2cf2b6c7f951dc49a6b9" FOREIGN KEY ("cost_center_id") REFERENCES "cost_center"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_1fdd0d65d22a9a9b3d43d7392d1" FOREIGN KEY ("created_by_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
