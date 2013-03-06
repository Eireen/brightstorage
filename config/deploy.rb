set :application, "brightstorage"

set :repository, "https://github.com/Eireen/brightstorage"
set :scm, "git"

server "10.9.0.2", :app, :web

set :port, 54321 #59736

user = "bright"

set :user, "#{user}"
set :use_sudo, false

set :deploy_to, "/home/#{user}/brightstorage"
set :deploy_via, :copy
set :keep_releases, 3

namespace :deploy do
  task :start do
    run "cd ~/mongroup && mongroup start storage"
  end
  task :stop do
    run "cd ~/mongroup && mongroup stop storage"
  end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "cd ~/mongroup && mongroup restart storage"
  end
  task :finalize_update do ; end
end

after "deploy:update", "deploy:cleanup", :configure_nginx

home_dir = "/home/#{user}"
project_dir = "#{home_dir}/brightstorage/current"
config_dir = "#{project_dir}/config"

desc "nginx config for storage"
task :configure_nginx, :roles => :web do
  nginx_conf_dir = "/usr/local/nginx/conf"
  run "sudo cp #{config_dir}/nginx/storage.conf #{nginx_conf_dir}"
  run "sudo cp #{config_dir}/nginx/st.passw.digest #{nginx_conf_dir}"
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