#!/bin/bash

cd ~

bash -l -c "backup generate:model -t brightside_st --archives --storages='dropbox' --compressors='gzip' --notifiers='mail'"

cd -