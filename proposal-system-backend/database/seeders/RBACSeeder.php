<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RBACSeeder extends Seeder
{
    public function run(): void
    {
        // 清除缓存
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 创建权限
        $permissions = [
            // 用户管理
            'manage-all-users' => '管理所有用户',
            'manage-users' => '管理普通用户',
            'view-users' => '查看用户',
            
            // 目录管理
            'create-directory' => '创建目录',
            'update-directory' => '修改目录',
            'delete-directory' => '删除目录',
            'view-directory' => '查看目录',
            
            // 文件管理
            'upload-file' => '上传文件',
            'download-file' => '下载文件',
            'update-file' => '修改文件',
            'delete-file' => '删除文件',
            'view-file' => '查看文件',
            
            // 工作组管理
            'manage-groups' => '管理工作组',
            'view-groups' => '查看工作组',
            
            // 提案管理
            'manage-proposals' => '管理提案',
            'view-proposals' => '查看提案',
        ];

        foreach ($permissions as $name => $description) {
            Permission::firstOrCreate([
                'name' => $name,
                'guard_name' => 'web',
            ]);
        }

        // 创建角色
        $superAdmin = Role::firstOrCreate([
            'name' => 'super_admin',
            'guard_name' => 'web',
        ]);

        $admin = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);

        $seniorMember = Role::firstOrCreate([
            'name' => 'senior_member',
            'guard_name' => 'web',
        ]);

        $member = Role::firstOrCreate([
            'name' => 'member',
            'guard_name' => 'web',
        ]);

        // 分配权限给角色
        
        // 超级管理员：所有权限
        $superAdmin->givePermissionTo(Permission::all());

        // 管理员：除了管理所有用户外的所有权限
        $admin->givePermissionTo([
            'manage-users',
            'view-users',
            'create-directory',
            'update-directory',
            'delete-directory',
            'view-directory',
            'upload-file',
            'download-file',
            'update-file',
            'delete-file',
            'view-file',
            'manage-groups',
            'view-groups',
            'manage-proposals',
            'view-proposals',
        ]);

        // 首席会员：查看和下载
        $seniorMember->givePermissionTo([
            'view-directory',
            'download-file',
            'view-file',
            'view-groups',
            'view-proposals',
        ]);

        // 普通会员：仅查看
        $member->givePermissionTo([
            'view-directory',
            'view-file',
            'view-groups',
            'view-proposals',
        ]);

        $this->command->info('角色和权限创建成功！');
    }
}
