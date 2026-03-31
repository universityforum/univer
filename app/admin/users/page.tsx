import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { UserActions } from '@/components/admin/user-actions'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-red-500/10 text-red-700',
    teacher: 'bg-blue-500/10 text-blue-700',
    student: 'bg-green-500/10 text-green-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Users</h1>
        <p className="text-muted-foreground">
          Manage platform users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            {users?.length || 0} registered user(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Registered</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.full_name || 'No name'}</span>
                        </div>
                      </td>
                      <td className="py-4 text-muted-foreground">{user.email}</td>
                      <td className="py-4">
                        <Badge className={roleColors[user.role] || ''} variant="secondary">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 text-muted-foreground">{user.department || '-'}</td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </td>
                      <td className="py-4">
                        <UserActions user={user} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No users
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
