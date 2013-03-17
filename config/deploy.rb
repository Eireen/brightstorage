set :application, "brightstorage"

set :repository, "https://github.com/Eireen/brightstorage"
set :scm, "git"

server "188.127.227.6", :app, :web

set :port, 12345 #59736

user = "bright"

set :user, "#{user}"
set :use_sudo, false

set :deploy_to, "/home/#{user}/brightstorage"
set :deploy_via, :copy
set :keep_releases, 3

namespace :deploy do
  task :start do
      run "cd ~/mongroup && mongroup start storage"
      run "sudo service nginx start"
    end
    task :stop do
      run "cd ~/mongroup && mongroup stop storage"
      run "sudo service nginx stop"
    end
    task :restart, :roles => :app, :except => { :no_release => true } do
      run "cd ~/mongroup && mongroup restart storage"
      run "sudo service nginx restart"
    end
    task :finalize_update do ; end
end

after "deploy:update", "deploy:cleanup", :configure_nginx, :configure_backup

home_dir = "/home/#{user}"
project_dir = "#{home_dir}/brightstorage/current"
config_dir = "#{project_dir}/config"

desc "Настройка nginx"
task :configure_nginx, :roles => :web do
  nginx_conf_dir = "/usr/local/nginx/conf"
  run "sudo cp #{config_dir}/nginx/storage.conf #{nginx_conf_dir}"
  run "sudo cp #{config_dir}/nginx/st.passw.digest #{nginx_conf_dir}"
end

desc "Настройка Backup"
task :configure_backup do
  run "if [ ! -f #{home_dir}/Backup/models/brightside_st.rb ]; then cd #{config_dir}/backup; ./backup_init.sh ; cd -; fi"
  run "cp #{config_dir}/brightside_st.rb #{home_dir}/Backup/models"
end

require 'capistrano/recipes/deploy/strategy/copy'

class BrightCopy < Capistrano::Deploy::Strategy::Copy

  def deploy!
    copy_cache ? run_copy_cache_strategy : run_copy_strategy

    `cd /home/eireen/deploy && ./preprocess.sh #{@destination} storage && cd -`

    create_revision_file
    compress_repository
    distribute!
  ensure
    rollback_changes
  end

end

set :strategy, BrightCopy.new(self)