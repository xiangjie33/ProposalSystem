<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CreateSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create-super-admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '创建超级管理员账户（生产环境安全方式）';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('=== 创建超级管理员 ===');
        $this->warn('注意：此命令仅用于初始化超级管理员账户');
        $this->newLine();
        
        // 检查是否已存在超级管理员
        $existingSuperAdmin = User::role('super_admin')->first();
        if ($existingSuperAdmin) {
            $this->error('⚠️  系统中已存在超级管理员！');
            $this->info('现有超级管理员邮箱：' . $existingSuperAdmin->email);
            $this->newLine();
            
            if (!$this->confirm('是否继续创建新的超级管理员？', false)) {
                $this->info('操作已取消');
                return 0;
            }
        }

        // 收集信息
        $name = $this->ask('请输入管理员姓名');
        
        // 验证姓名
        if (empty($name)) {
            $this->error('姓名不能为空！');
            return 1;
        }

        $email = $this->ask('请输入管理员邮箱');
        
        // 验证邮箱
        $validator = Validator::make(['email' => $email], [
            'email' => 'required|email|unique:users,email'
        ]);
        
        if ($validator->fails()) {
            $this->error('邮箱验证失败：' . $validator->errors()->first('email'));
            return 1;
        }

        // 输入密码（隐藏显示）
        $password = $this->secret('请输入密码（至少8位，建议12位以上）');
        
        if (strlen($password) < 8) {
            $this->error('密码长度至少为8位！');
            return 1;
        }

        $passwordConfirm = $this->secret('请再次输入密码');
        
        if ($password !== $passwordConfirm) {
            $this->error('两次输入的密码不一致！');
            return 1;
        }

        // 确认信息
        $this->newLine();
        $this->info('=== 请确认以下信息 ===');
        $this->table(
            ['字段', '值'],
            [
                ['姓名', $name],
                ['邮箱', $email],
                ['角色', '超级管理员 (super_admin)'],
                ['状态', '激活 (active)'],
            ]
        );

        if (!$this->confirm('确认创建？', true)) {
            $this->info('操作已取消');
            return 0;
        }

        try {
            // 创建用户
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'status' => 'active',
            ]);

            // 分配超级管理员角色
            $user->assignRole('super_admin');

            // 加入默认工作组
            $defaultGroup = \App\Models\Group::where('name', 'default_group')->first();
            if ($defaultGroup) {
                $user->groups()->attach($defaultGroup->id);
                $this->info("✅ 已加入默认工作组：{$defaultGroup->display_name}");
            }

            $this->newLine();
            $this->info('✅ 超级管理员创建成功！');
            $this->newLine();
            $this->table(
                ['信息', '值'],
                [
                    ['用户ID', $user->id],
                    ['姓名', $user->name],
                    ['邮箱', $user->email],
                    ['角色', '超级管理员'],
                    ['权限数', $user->getAllPermissions()->count()],
                ]
            );
            
            $this->newLine();
            $this->warn('⚠️  重要提示：');
            $this->warn('1. 请妥善保管登录凭证！');
            $this->warn('2. 建议首次登录后立即修改密码！');
            $this->warn('3. 不要与他人共享超级管理员账户！');
            
            // 记录日志
            Log::channel('single')->info('超级管理员账户已创建', [
                'user_id' => $user->id,
                'email' => $email,
                'name' => $name,
                'created_by' => 'artisan_command',
                'ip' => request()->ip() ?? 'CLI',
                'timestamp' => now()->toDateTimeString()
            ]);

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ 创建失败：' . $e->getMessage());
            Log::error('超级管理员创建失败', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}
