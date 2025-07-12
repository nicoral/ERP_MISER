import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752283686053 implements MigrationInterface {
    name = 'Migrations1752283686053'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "quotation_supplier_service" ("id" SERIAL NOT NULL, "quantity" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "quotation_supplier_id" integer, "requirement_service_id" integer, CONSTRAINT "PK_cad9ab525710673e43c3f752c27" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."supplier_quotation_service_item_status_enum" AS ENUM('QUOTED', 'NOT_AVAILABLE', 'NOT_QUOTED')`);
        await queryRunner.query(`CREATE TYPE "public"."supplier_quotation_service_item_durationtype_enum" AS ENUM('HORA', 'CONTRATO', 'DIA', 'JORNADA')`);
        await queryRunner.query(`CREATE TABLE "supplier_quotation_service_item" ("id" SERIAL NOT NULL, "status" "public"."supplier_quotation_service_item_status_enum" NOT NULL DEFAULT 'NOT_QUOTED', "unitPrice" numeric(15,2), "currency" character varying NOT NULL DEFAULT 'PEN', "deliveryTime" integer, "notes" text, "reasonNotAvailable" text, "durationType" "public"."supplier_quotation_service_item_durationtype_enum", "duration" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "supplier_quotation_id" integer, "requirement_service_id" integer, CONSTRAINT "PK_b6df65e468067b486ded8380c32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."final_selection_service_item_durationtype_enum" AS ENUM('HORA', 'CONTRATO', 'DIA', 'JORNADA')`);
        await queryRunner.query(`CREATE TABLE "final_selection_service_item" ("id" SERIAL NOT NULL, "unitPrice" numeric(15,4) NOT NULL, "currency" character varying NOT NULL DEFAULT 'PEN', "deliveryTime" integer, "notes" text, "durationType" "public"."final_selection_service_item_durationtype_enum", "duration" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "final_selection_id" integer, "requirement_service_id" integer, "supplier_id" integer, "supplier_quotation_service_item_id" integer, CONSTRAINT "PK_778fd12daa71d11936054a86708" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "quotation_supplier_service" ADD CONSTRAINT "FK_89c62ac6920716673a409c5135d" FOREIGN KEY ("quotation_supplier_id") REFERENCES "quotation_supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quotation_supplier_service" ADD CONSTRAINT "FK_83e9c0d2dcd870c4f2d93023b97" FOREIGN KEY ("requirement_service_id") REFERENCES "requirement_service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supplier_quotation_service_item" ADD CONSTRAINT "FK_7ba8f9149d0a8a6e6a947cb2682" FOREIGN KEY ("supplier_quotation_id") REFERENCES "supplier_quotation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supplier_quotation_service_item" ADD CONSTRAINT "FK_6afb45c79a6084c5d8be8c0d265" FOREIGN KEY ("requirement_service_id") REFERENCES "requirement_service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "final_selection_service_item" ADD CONSTRAINT "FK_a3c13f7f970dd94cb91f7ffad92" FOREIGN KEY ("final_selection_id") REFERENCES "final_selection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "final_selection_service_item" ADD CONSTRAINT "FK_022f2243c845aab93b546c68708" FOREIGN KEY ("requirement_service_id") REFERENCES "requirement_service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "final_selection_service_item" ADD CONSTRAINT "FK_808303e495b8563d6b7e53279b1" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "final_selection_service_item" ADD CONSTRAINT "FK_b97237117d542e1ee18de5ce400" FOREIGN KEY ("supplier_quotation_service_item_id") REFERENCES "supplier_quotation_service_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "final_selection_service_item" DROP CONSTRAINT "FK_b97237117d542e1ee18de5ce400"`);
        await queryRunner.query(`ALTER TABLE "final_selection_service_item" DROP CONSTRAINT "FK_808303e495b8563d6b7e53279b1"`);
        await queryRunner.query(`ALTER TABLE "final_selection_service_item" DROP CONSTRAINT "FK_022f2243c845aab93b546c68708"`);
        await queryRunner.query(`ALTER TABLE "final_selection_service_item" DROP CONSTRAINT "FK_a3c13f7f970dd94cb91f7ffad92"`);
        await queryRunner.query(`ALTER TABLE "supplier_quotation_service_item" DROP CONSTRAINT "FK_6afb45c79a6084c5d8be8c0d265"`);
        await queryRunner.query(`ALTER TABLE "supplier_quotation_service_item" DROP CONSTRAINT "FK_7ba8f9149d0a8a6e6a947cb2682"`);
        await queryRunner.query(`ALTER TABLE "quotation_supplier_service" DROP CONSTRAINT "FK_83e9c0d2dcd870c4f2d93023b97"`);
        await queryRunner.query(`ALTER TABLE "quotation_supplier_service" DROP CONSTRAINT "FK_89c62ac6920716673a409c5135d"`);
        await queryRunner.query(`DROP TABLE "final_selection_service_item"`);
        await queryRunner.query(`DROP TYPE "public"."final_selection_service_item_durationtype_enum"`);
        await queryRunner.query(`DROP TABLE "supplier_quotation_service_item"`);
        await queryRunner.query(`DROP TYPE "public"."supplier_quotation_service_item_durationtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."supplier_quotation_service_item_status_enum"`);
        await queryRunner.query(`DROP TABLE "quotation_supplier_service"`);
    }

}
