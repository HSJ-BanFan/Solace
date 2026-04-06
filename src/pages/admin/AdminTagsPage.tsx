import { useState } from 'react';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks';
import { LoadingButton, InputField } from '@/components';
import { Icon } from '@iconify/react';
import type { Tag } from '@/types';

export function AdminTagsPage() {
  const { data: tags, isLoading, error } = useTags();
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [errorForm, setErrorForm] = useState('');

  const resetForm = () => {
    setName('');
    setErrorForm('');
    setEditingTag(null);
    setShowForm(false);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setName(tag.name);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个标签吗？')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm('');

    if (!name.trim()) {
      setErrorForm('名称不能为空');
      return;
    }

    try {
      if (editingTag) {
        await updateMutation.mutateAsync({
          id: editingTag.id,
          data: { name },
        });
      } else {
        await createMutation.mutateAsync({ name });
      }
      resetForm();
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : '保存失败');
    }
  };

  if (error) {
    return (
      <div className="card-base p-8 text-center fade-in-up">
        <div className="w-16 h-16 rounded-full bg-red-500/10 mx-auto mb-4 flex items-center justify-center">
          <Icon icon="material-symbols:error-outline-rounded" className="text-3xl text-red-500" />
        </div>
        <p className="text-75">加载标签列表失败</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="card-base p-6 fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--klein-blue)] to-[var(--sky-blue)] flex items-center justify-center">
              <Icon icon="material-symbols:label-outline-rounded" className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-90 text-xl font-bold">标签管理</h1>
              <p className="text-50 text-sm">共 {tags?.length || 0} 个标签</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-regular rounded-[var(--radius-medium)] py-2 px-4 font-medium scale-animation ripple"
          >
            <Icon icon="material-symbols:add-rounded" className="mr-1" />
            新建
          </button>
        </div>
      </div>

      {/* 表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-base p-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
          {errorForm && (
            <div className="bg-red-500/10 text-red-500 rounded-[var(--radius-medium)] p-3 mb-4 text-sm">
              {errorForm}
            </div>
          )}

          <InputField
            label="名称"
            value={name}
            onChange={setName}
            placeholder="标签名称"
            required
          />

          <div className="flex gap-2 mt-4">
            <LoadingButton
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-[var(--klein-blue)] to-[var(--klein-blue-light)] text-white"
            >
              {editingTag ? '更新' : '创建'}
            </LoadingButton>
            <button
              type="button"
              onClick={resetForm}
              className="btn-plain rounded-[var(--radius-medium)] py-3 px-6 scale-animation ripple"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* 标签列表 */}
      {isLoading ? (
        <div className="card-base animate-pulse p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          ))}
        </div>
      ) : (
        <div className="card-base fade-in-up" style={{ animationDelay: '0.15s' }}>
          {!tags || tags.length === 0 ? (
            <div className="p-8 text-center text-50">
              <Icon icon="material-symbols:label-outline-rounded" className="text-4xl mb-4" />
              <p>暂无标签</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-light)]">
              {tags.map((tag) => (
                <div key={tag.id} className="p-4 flex items-center gap-4 hover:bg-[var(--btn-plain-bg-hover)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-90 font-bold mb-1">{tag.name}</div>
                    <div className="flex items-center gap-2 text-50 text-xs">
                      <span>Slug: {tag.slug}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--btn-regular-bg)]">
                        {tag.article_count || 0} 篇文章
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="btn-plain rounded-[var(--radius-medium)] h-9 w-9 scale-animation ripple"
                      title="编辑"
                    >
                      <Icon icon="material-symbols:edit-outline-rounded" className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      disabled={deleteMutation.isPending}
                      className="btn-plain rounded-[var(--radius-medium)] h-9 w-9 text-red-500 hover:bg-red-500/10 scale-animation ripple"
                      title="删除"
                    >
                      <Icon icon="material-symbols:delete-outline-rounded" className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}