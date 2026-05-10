import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useCreateMoment } from "@/hooks";
import { LoadingButton, TextAreaField } from "@/components";
import { showToast } from "@/components";

const momentSchema = z.object({
	content: z.string().min(1, "内容不能为空"),
});

type MomentFormData = z.infer<typeof momentSchema>;

export function MomentEditorPage() {
	const navigate = useNavigate();
	const createMutation = useCreateMoment();

	const {
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<MomentFormData>({
		resolver: zodResolver(momentSchema),
		defaultValues: {
			content: "",
		},
	});

	const content = watch("content");

	const onSubmit = async (data: MomentFormData) => {
		try {
			await createMutation.mutateAsync({ content: data.content });
			showToast("说说发布成功", "success");
			reset();
			navigate("/admin/moments");
		} catch (err) {
			showToast(
				err instanceof Error ? err.message : "发布失败",
				"error"
			);
		}
	};

	return (
		<div className="space-y-4">
			<div className="card-base p-4 fade-in-up">
				<h2 className="text-90 font-bold text-lg mb-4">发布说说</h2>
				<p className="text-50 text-sm mb-4">
					分享你的想法、心情或生活点滴
				</p>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="card-base p-4 fade-in-up" style={{ animationDelay: "0.1s" }}>
					<TextAreaField
						label="内容"
						placeholder="写下你的想法..."
						rows={6}
						value={content}
						onChange={(value) => setValue("content", value, { shouldValidate: true, shouldDirty: true })}
						error={errors.content?.message}
					/>
				</div>

				<div className="card-base p-4 fade-in-up flex justify-end gap-2" style={{ animationDelay: "0.2s" }}>
					<button
						type="button"
						onClick={() => reset()}
						className="btn-regular btn-sm py-2 px-4"
					>
						重置
					</button>
					<LoadingButton
						type="submit"
						loading={createMutation.isPending}
						className="btn-primary btn-sm py-2 px-6"
					>
						发布
					</LoadingButton>
				</div>
			</form>
		</div>
	);
}
