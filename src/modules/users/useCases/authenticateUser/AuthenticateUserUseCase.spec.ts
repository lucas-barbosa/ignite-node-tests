import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: IUsersRepository;
let authenticateUser: AuthenticateUserUseCase;
let createUser: CreateUserUseCase;

describe('Authenticate User: usecase', () => {
  let user: User;

  const userData = {
    name: 'username',
    email: 'user@gmail.com',
    password: 'password'
  };

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUser = new AuthenticateUserUseCase(usersRepository);
    createUser = new CreateUserUseCase(usersRepository);
    user = await createUser.execute(userData)
  });

  it('should verify if email is correct', async() => {
    jest.spyOn(usersRepository, 'findByEmail');

    await expect(authenticateUser.execute({ email: 'invalid-email', password: userData.password }))
      .rejects
      .toBeInstanceOf(IncorrectEmailOrPasswordError);

    expect(usersRepository.findByEmail).toBeCalledTimes(1);
    expect(usersRepository.findByEmail).toBeCalledWith('invalid-email');
  });

  it('should compare if password is correct', async() => {
    jest.spyOn(bcrypt, 'compare');

    await expect(authenticateUser.execute({ email: userData.email, password: 'invalid-password' }))
      .rejects
      .toBeInstanceOf(IncorrectEmailOrPasswordError);

    expect(bcrypt.compare).toBeCalledTimes(1);
    expect(bcrypt.compare).toBeCalledWith('invalid-password', user.password);
  });

  it('should generate a token', async() => {
    jest.spyOn(jwt, 'sign');

    await authenticateUser.execute({ email: userData.email, password: userData.password });

    expect(jwt.sign).toBeCalledTimes(1);
    expect(jwt.sign).toBeCalledWith({ user }, expect.anything(), expect.objectContaining({
      subject: user.id
    }));
  });

  it('should return user data and token', async() => {
    const response = await authenticateUser.execute({ email: userData.email, password: userData.password });

    expect(response.token).toBeTruthy();
    expect(response.user).toEqual({
      id: user.id,
      name: user.name,
      email: user.email
    });
  });
});
