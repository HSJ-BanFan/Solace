import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks';
import { LoadingButton, InputField, TextAreaField } from '@/components';
import { Icon } from '@iconify/react';
import type { Category } from '@/types';

export function AdminCategoriesPage() {
  const { data: categories, isLoading, error } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [errorForm, setErrorForm] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setSortOrder('0');
    setErrorForm('');
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setSortOrder(String(category.sort_order));
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个分类吗？')) return;
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
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          data: {
            name,
            description,
            sort_order: parseInt(sortOrder) || 0,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name,
          description,
          sort_order: parseInt(sortOrder) || 0,
        });
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
        <p className="text-75">加载分类列表失败</p>
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
              <Icon icon="material-symbols:category-outline-rounded" className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-90 text-xl font-bold">分类管理</h1>
              <p className="text-50 text-sm">共 {categories?.length || 0} 个分类</p>
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
            placeholder="分类名称"
            required
          />

          <TextAreaField
            label="描述"
            value={description}
            onChange={setDescription}
            placeholder="分类简要描述"
            rows={2}
          />

          <InputField
            label="排序"
            type="number"
            value={sortOrder}
            onChange={setSortOrder}
            placeholder="排序顺序（数字越小越靠前）"
          />

          <div className="flex gap-2 mt-4">
            <LoadingButton
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-[var(--klein-blue)] to-[var(--klein-blue-light)] text-white"
            >
              {editingCategory ? '更新' : '创建'}
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

      {/* 分类列表 */}
      {isLoading ? (
        <div className="card-base animate-pulse p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          ))}
        </div>
      ) : (
        <div className="card-base fade-in-up" style={{ animationDelay: '0.15s' }}>
          {!categories || categories.length === 0 ? (
            <div className="p-8 text-center text-50">
              <Icon icon="material-symbols:category-outline-rounded" className="text-4xl mb-4" />
              <p>暂无分类</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-light)]">
              {categories.map((category) => (
                <div key={category.id} className="p-4 flex items-center gap-4 hover:bg-[var(--btn-plain-bg-hover)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-90 font-bold mb-1">{category.name}</div>
                    <div className="flex items-center gap-2 text-50 text-xs">
                      <span>Slug: {category.slug}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--btn-regular-bg)]">
                        {category.article_count || 0} 篇文章
                      </span>
                      <span>•</span>
                      <span>排序: {category.sort_order}</span>
                    </div>
                    {category.description && (
                      <div className="text-50 text-sm mt-1">{category.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(category)}
                      className="btn-plain rounded-[var(--radius-medium)] h-9 w-9 scale-animation ripple"
                      title="编辑"
                    >
                      <Icon icon="material-symbols:edit-outline-rounded" className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
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