CREATE TABLE "vocabulary_items" (
	"id" text PRIMARY KEY NOT NULL,
	"tlicho" text NOT NULL,
	"english" text NOT NULL,
	"audio_src" text,
	"alternate_audio_srcs" text[],
	"category" text,
	"part_of_speech" text,
	"example_tlicho" text,
	"example_english" text,
	"notes" text,
	"image_src" text,
	"source_url" text,
	"verification_status" text DEFAULT 'source-checked' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "vocabulary_item_id" text;
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "activity_type" text;
--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "current_streak" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "last_activity_at" timestamp with time zone;
--> statement-breakpoint
CREATE TABLE "fsrs_cards" (
	"user_id" text NOT NULL,
	"item_id" text NOT NULL,
	"due" timestamp with time zone NOT NULL,
	"stability" double precision DEFAULT 0 NOT NULL,
	"difficulty" double precision DEFAULT 0 NOT NULL,
	"elapsed_days" integer DEFAULT 0 NOT NULL,
	"scheduled_days" integer DEFAULT 0 NOT NULL,
	"learning_steps" integer DEFAULT 0 NOT NULL,
	"reps" integer DEFAULT 0 NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"state" integer DEFAULT 0 NOT NULL,
	"last_review" timestamp with time zone,
	"encountered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fsrs_cards_user_id_item_id_pk" PRIMARY KEY("user_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "fsrs_review_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"item_id" text NOT NULL,
	"rating" integer NOT NULL,
	"reviewed_at" timestamp with time zone NOT NULL,
	"state_before" integer NOT NULL,
	"state_after" integer NOT NULL,
	"due_before" timestamp with time zone NOT NULL,
	"due_after" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_vocabulary_item_id_vocabulary_items_id_fk" FOREIGN KEY ("vocabulary_item_id") REFERENCES "public"."vocabulary_items"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "fsrs_cards" ADD CONSTRAINT "fsrs_cards_item_id_vocabulary_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."vocabulary_items"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "fsrs_review_history" ADD CONSTRAINT "fsrs_review_history_item_id_vocabulary_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."vocabulary_items"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "fsrs_cards_user_due_idx" ON "fsrs_cards" USING btree ("user_id","due");
--> statement-breakpoint
CREATE INDEX "fsrs_review_history_user_idx" ON "fsrs_review_history" USING btree ("user_id");
