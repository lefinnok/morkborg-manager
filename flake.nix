{
  description = "A Node.js and React development environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };

        # Specify the Node.js version you want to use
        nodejs = pkgs.nodejs;

        # Create a custom npm that uses the specified Node.js version
        customNpm = pkgs.writeShellScriptBin "npm" ''
          ${nodejs}/bin/npm "$@"
        '';

      in {
        devShell = pkgs.mkShell {
          name = "nodejs-react-dev-shell";

          buildInputs = with pkgs; [
            nodejs
            customNpm
            yarn
            git
            # vscode
          ];

          shellHook = ''
            export PS1="\[\033[1;33m\][nodejs-react-dev-shell]\[\033[0m\] \[\033[1;32m\]\u@\h\[\033[0m\] \[\033[1;34m\]\w\[\033[0m\] \$ "
            

            echo "Node.js version: $(${nodejs}/bin/node --version)"
            echo "npm version: $(${customNpm}/bin/npm --version)"
            echo "React project is ready. You can start the development server with 'npm start'"
          '';
        };
      }
    );
}
