<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Group;

class MigrateUsersSeeder extends Seeder
{
    public function run(): void
    {
        $defaultGroup = Group::where('name', 'default_group')->first();

        if (!$defaultGroup) {
            $this->command->error('默认工作组不存在，请先运行 GroupSeeder');
            return;
        }

        $users = User::all();

        foreach ($users as $user) {
            // 迁移角色
            $currentRoles = $user->getRoleNames();
            
            if ($currentRoles->contains('admin')) {
                // 将现有的 admin 角色用户设置为 super_admin
                $user->syncRoles(['super_admin']);
                $this->command->info("用户 {$user->name} 已设置为超级管理员");
            } elseif ($currentRoles->contains('user')) {
                // 将现有的 user 角色用户设置为 member
                $user->syncRoles(['member']);
                $this->command->info("用户 {$user->name} 已设置为普通会员");
            } else {
                // 没有角色的用户设置为 member
                $user->assignRole('member');
                $this->command->info("用户 {$user->name} 已设置为普通会员");
            }

            // 将所有用户分配到默认工作组
            if (!$user->groups()->where('group_id', $defaultGroup->id)->exists()) {
                $user->groups()->attach($defaultGroup->id);
                $this->command->info("用户 {$user->name} 已加入默认工作组");
            }
        }

        $this->command->info('用户数据迁移完成！');
    }
}
