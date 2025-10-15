<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class FixUserStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:fix-status {--all : 激活所有用户}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '修复用户状态（将管理员设置为 active）';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('=== 修复用户状态 ===');
        $this->newLine();
        
        if ($this->option('all')) {
            // 激活所有用户
            $this->activateAllUsers();
        } else {
            // 只激活管理员
            $this->activateAdmins();
        }
        
        return 0;
    }
    
    /**
     * 激活所有管理员
     */
    protected function activateAdmins()
    {
        $this->info('正在检查管理员账户...');
        
        // 获取所有管理员（超级管理员和普通管理员）
        $admins = User::role(['super_admin', 'admin'])->get();
        
        if ($admins->isEmpty()) {
            $this->warn('⚠️  系统中没有管理员账户');
            return;
        }
        
        $this->table(
            ['ID', '姓名', '邮箱', '角色', '当前状态'],
            $admins->map(function ($user) {
                return [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->roles->pluck('name')->join(', '),
                    $user->status,
                ];
            })
        );
        
        $count = 0;
        foreach ($admins as $admin) {
            if ($admin->status !== 'active') {
                $admin->status = 'active';
                $admin->save();
                $this->info("✅ 已激活：{$admin->name} ({$admin->email})");
                $count++;
            }
        }
        
        $this->newLine();
        if ($count > 0) {
            $this->info("✅ 共激活 {$count} 个管理员账户");
        } else {
            $this->info("✅ 所有管理员账户状态正常");
        }
    }
    
    /**
     * 激活所有用户
     */
    protected function activateAllUsers()
    {
        $this->warn('⚠️  此操作将激活所有用户（包括待审核的用户）');
        
        if (!$this->confirm('确定要继续吗？', false)) {
            $this->info('操作已取消');
            return;
        }
        
        $pendingUsers = User::where('status', 'pending')->get();
        
        if ($pendingUsers->isEmpty()) {
            $this->info('✅ 没有待激活的用户');
            return;
        }
        
        $this->table(
            ['ID', '姓名', '邮箱', '角色', '状态'],
            $pendingUsers->map(function ($user) {
                return [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->roles->pluck('name')->join(', ') ?: '无',
                    $user->status,
                ];
            })
        );
        
        $count = 0;
        foreach ($pendingUsers as $user) {
            $user->status = 'active';
            $user->save();
            $this->info("✅ 已激活：{$user->name} ({$user->email})");
            $count++;
        }
        
        $this->newLine();
        $this->info("✅ 共激活 {$count} 个用户");
    }
}
