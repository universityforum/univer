import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CategoryList } from '@/components/admin/category-list'
import { CategoryForm } from '@/components/admin/category-form'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*, posts(count)')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground">
            Manage forum categories
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Category List</CardTitle>
              <CardDescription>
                {categories?.length || 0} category(ies)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryList categories={categories || []} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>New Category</CardTitle>
              <CardDescription>
                Add a category to the forum
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
