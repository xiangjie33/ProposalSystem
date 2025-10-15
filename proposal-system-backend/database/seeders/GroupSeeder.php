<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Group;

class GroupSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            [
                'name' => 'default_group',
                'display_name' => '用户组',
                'description' => '默认工作组，所有新注册用户自动加入此组',
            ],
            [
                'name' => 'dev_group',
                'display_name' => '开发组',
                'description' => '开发人员工作组',
            ],
            [
                'name' => 'test_group',
                'display_name' => '测试组',
                'description' => '测试人员工作组',
            ],
            [
                'name' => 'review_group',
                'display_name' => '评审组',
                'description' => '评审人员工作组',
            ],
        ];

        foreach ($groups as $group) {
            Group::create($group);
        }

        $this->command->info('工作组创建成功！');
    }
}
