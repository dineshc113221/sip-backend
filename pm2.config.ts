interface App {
    name: string;
    script: string;
    node_args: string;
    env_development?: {
        args: string[];
    };
    env_qa?: {
        args: string[];
    };
}
 
export const pm2Config: { apps: App[] } = {
    apps: [
        {
            name: 'SIP Backend APIs',
            script: 'src/server.js',
            node_args: '-r dotenv/config',
            env_development: {
                args: ['dotenv_config_path=./dev.env', 'dotenv_config_debug=true'],
            },
            env_qa: {
                args: ['dotenv_config_path=./qa.env', 'dotenv_config_debug=true'],
            }
        }
    ]
};
 