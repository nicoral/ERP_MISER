import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751845994895 implements MigrationInterface {
    name = 'Migrations1751845994895'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_group" DROP CONSTRAINT "FK_be6b20f842968065879a2d411d3"`);
        await queryRunner.query(`ALTER TABLE "payment_group" ADD CONSTRAINT "UQ_be6b20f842968065879a2d411d3" UNIQUE ("quotation_request_id")`);
        await queryRunner.query(`ALTER TABLE "payment_group" ADD CONSTRAINT "FK_be6b20f842968065879a2d411d3" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE "payment"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_group" DROP CONSTRAINT "FK_be6b20f842968065879a2d411d3"`);
        await queryRunner.query(`ALTER TABLE "payment_group" DROP CONSTRAINT "UQ_be6b20f842968065879a2d411d3"`);
        await queryRunner.query(`ALTER TABLE "payment_group" ADD CONSTRAINT "FK_be6b20f842968065879a2d411d3" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "status" "public"."payment_status_enum" NOT NULL DEFAULT 'PENDING', "amount" numeric(15,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "quotation_request_id" integer, "created_by" integer, "approved_by" integer, CONSTRAINT "UQ_fdf30a0462a3bdfc1125d21b4bc" UNIQUE ("code"), CONSTRAINT "PK_f5291e4f14436b1038ef65ad120" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_fdf30a0462a3bdfc1125d21b4bc" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_100fb15d5b419c57caee67bdcdc" FOREIGN KEY ("created_by") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_17bcc738aa1d66789e7f65cfdce" FOREIGN KEY ("approved_by") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
